"use client";

import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { PendingAccountAdminReviewDto } from "@/models/open-account-admin/pending-account.response";

type ActionType = "APPROVE" | "REJECT";

interface PendingAccountActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ActionType;
  account?: PendingAccountAdminReviewDto;
  onConfirm: (remark?: string) => Promise<void> | void;
  isLoading: boolean;
}

type DialogVariant = "info" | "danger";

interface DialogProps {
  variant: DialogVariant;
  confirmLabel: string;
  confirmButtonIcon: React.ReactNode;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}

export default function PendingAccountActionDialog({
  isOpen,
  onClose,
  actionType,
  account,
  onConfirm,
  isLoading,
}: PendingAccountActionDialogProps) {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemark("");
    }
  }, [isOpen]);

  const getDialogProps = (): DialogProps => {
    switch (actionType) {
      case "APPROVE":
        return {
          variant: "info",
          confirmLabel: "Approve",
          confirmButtonIcon: <CheckCircle className="h-4 w-4 mr-1" />,
          icon: <CheckCircle className="h-14 w-14 text-orange-500" />,
          defaultTitle: "Approve Account Opening Request",
          defaultDescription:
            "You are about to approve this account opening request. This action cannot be undone.",
        };
      case "REJECT":
        return {
          variant: "danger",
          confirmLabel: "Reject",
          confirmButtonIcon: <XCircle className="h-4 w-4 mr-1" />,
          icon: <XCircle className="h-14 w-14 text-red-500" />,
          defaultTitle: "Reject Account Opening Request",
          defaultDescription:
            "You are about to reject this account opening request. Please provide a reason.",
        };
      default:
        return {
          variant: "info",
          confirmLabel: "Confirm",
          confirmButtonIcon: <Clock className="h-4 w-4 mr-1" />,
          icon: <Clock className="h-14 w-14 text-yellow-500" />,
          defaultTitle: "Confirm Action",
          defaultDescription: "Please confirm this action.",
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
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = () => {
    switch (actionType) {
      case "APPROVE":
        return (
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Approving
          </span>
        );
      case "REJECT":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Rejecting
          </span>
        );
      default:
        return null;
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
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
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

            {/* Account Details */}
            {account && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-2">
                <DetailRow label="Legal ID" value={account.legalId} />
                <DetailRow
                  label="Name"
                  value={`${account.legalFirstNameEn || ""} ${account.legalLastNameEn || ""}`.trim()}
                />
                <DetailRow label="Email" value={account.email} />
                <DetailRow label="Phone" value={account.phoneNumber} />
                <DetailRow
                  label="AML Status"
                  value={account.amlStatus || "---"}
                />
              </div>
            )}

            {/* Remark Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === "REJECT" ? "Rejection Reason (Required)" : "Remark (Optional)"}
              </label>
              <Textarea
                placeholder={
                  actionType === "REJECT"
                    ? "Please explain the reason for rejection..."
                    : "Add a comment or note..."
                }
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full resize-none"
                rows={4}
                disabled={isLoading}
              />
              {actionType === "REJECT" && remark.length === 0 && (
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
                onClick={() => onConfirm(remark)}
                disabled={
                  isLoading ||
                  (actionType === "REJECT" && remark.trim().length === 0)
                }
                className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${getButtonColor()} transition-colors ${
                  (isLoading ||
                    (actionType === "REJECT" && remark.trim().length === 0)) &&
                  "opacity-70 cursor-not-allowed"
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
                    {actionType === "APPROVE" ? "Approve" : "Reject"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex justify-between text-gray-700">
    <span className="font-medium">{label}:</span>
    <span className="text-right flex-1 ml-4 break-words">{value || "---"}</span>
  </div>
);
