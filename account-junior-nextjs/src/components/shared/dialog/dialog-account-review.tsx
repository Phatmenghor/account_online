"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface AccountReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: "approve" | "reject";
  onConfirm: (remark?: string) => Promise<void> | void;
  isLoading: boolean;
  accountDetails?: {
    id: string;
    legalId: string;
    name: string;
    phoneNumber: string;
  };
}

type DialogVariant = "approve" | "reject";

interface DialogProps {
  variant: DialogVariant;
  confirmLabel: string;
  confirmButtonIcon: React.ReactNode;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
  requireRemark: boolean;
}

const AccountReviewDialog = ({
  isOpen,
  onClose,
  action,
  onConfirm,
  isLoading,
  accountDetails,
}: AccountReviewDialogProps) => {
  const [remark, setRemark] = useState("");

  // Reset remark when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setRemark("");
    }
  }, [isOpen]);

  const getDialogProps = (): DialogProps => {
    switch (action) {
      case "approve":
        return {
          variant: "approve",
          confirmLabel: "Approve Account",
          confirmButtonIcon: <CheckCircle className="h-4 w-4 mr-1" />,
          icon: <CheckCircle className="h-14 w-14 text-green-500" />,
          defaultTitle: "Approve Account Opening Request",
          defaultDescription:
            "You are about to approve this account opening request. This action cannot be undone.",
          requireRemark: false,
        };
      case "reject":
        return {
          variant: "reject",
          confirmLabel: "Reject Account",
          confirmButtonIcon: <XCircle className="h-4 w-4 mr-1" />,
          icon: <XCircle className="h-14 w-14 text-red-500" />,
          defaultTitle: "Reject Account Opening Request",
          defaultDescription:
            "You are about to reject this account opening request. Please provide a reason.",
          requireRemark: true,
        };
      default:
        return {
          variant: "approve",
          confirmLabel: "Confirm",
          confirmButtonIcon: <CheckCircle className="h-4 w-4 mr-1" />,
          icon: <CheckCircle className="h-14 w-14 text-blue-500" />,
          defaultTitle: "Confirm Action",
          defaultDescription: "Please confirm this action.",
          requireRemark: false,
        };
    }
  };

  const dialogProps = getDialogProps();

  const getButtonColor = () => {
    switch (dialogProps.variant) {
      case "approve":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "reject":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusBadge = () => {
    switch (action) {
      case "approve":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Approving
          </span>
        );
      case "reject":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Rejecting
          </span>
        );
      default:
        return null;
    }
  };

  const isFormValid =
    !dialogProps.requireRemark || (dialogProps.requireRemark && remark.trim());

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
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative"
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
                  {dialogProps.defaultTitle}
                </h2>
              </div>
              {getStatusBadge()}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              {dialogProps.defaultDescription}
            </p>

            {/* Account Details Section */}
            {accountDetails && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-2">
                <DetailRow label="Legal ID" value={accountDetails.legalId} />
                <DetailRow label="Name" value={accountDetails.name} />
                <DetailRow label="Phone" value={accountDetails.phoneNumber} />
              </div>
            )}

            {/* Remark Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {action === "reject" ? "Rejection Reason (Required)" : "Remark (Optional)"}
              </label>
              <Textarea
                placeholder={
                  action === "reject"
                    ? "Please explain the reason for rejection..."
                    : "Add a comment or note..."
                }
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full resize-none"
                rows={4}
                disabled={isLoading}
              />
              {action === "reject" && !remark.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  Rejection reason is required
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors ${
                  isLoading && "opacity-50 cursor-not-allowed"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={() => onConfirm(remark || undefined)}
                disabled={isLoading || !isFormValid}
                className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${getButtonColor()} transition-colors ${
                  (isLoading || !isFormValid) && "opacity-70 cursor-not-allowed"
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

export default AccountReviewDialog;
