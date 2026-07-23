"use client";

import type React from "react";
import { Shield, ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HistoryModel } from "@/features/aml/types/history/response/history-response.model";
import { getAmlHistoryByIdService } from "@/features/aml/services/aml-history.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import { getRoleDisplayName } from "@/utils/role-display";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface AmlHistoryViewModalProps {
  history?: HistoryModel;
  historyId?: number;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 gap-4">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">
        {value || <span className="text-muted-foreground italic font-normal">N/A</span>}
      </span>
    </div>
  );
}

function InfoRowFull({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 gap-4 col-span-full">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">
        {value || <span className="text-muted-foreground italic font-normal">N/A</span>}
      </span>
    </div>
  );
}

function SectionHeader({ color, title }: { color?: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-1 h-5 ${color || "bg-primary"} rounded-full shrink-0`} />
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
  );
}

export default function AmlHistoryViewDetailModal({
  history: initialHistory,
  historyId,
  isOpen,
  onClose,
}: AmlHistoryViewModalProps) {
  const [history, setHistory] = useState<HistoryModel | undefined>(initialHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialHistory) { setHistory(initialHistory); return; }
    if (historyId) {
      setLoading(true);
      getAmlHistoryByIdService(historyId)
        .then(setHistory)
        .catch((err) => console.error("Failed to fetch AML history:", err))
        .finally(() => setLoading(false));
    }
  }, [historyId, initialHistory, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-w-2xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">

        {/* ── Header ── */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">AML History Details</DialogTitle>
              <DialogDescription className="sr-only">AML History Details</DialogDescription>
              {history && <div className="mt-1"><AmlStatusBadge status={history.status} /></div>}
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading history...</div>
          ) : !history ? (
            <div className="text-center py-16 text-muted-foreground">No history data available</div>
          ) : (
            <div className="p-6 space-y-6">

              {/* ── Document Images (at top) ── */}
              {(history.nidImageName || history.selfieImageName) && (
                <>
                  <div className="space-y-4">
                    <SectionHeader color="bg-primary" title="Document Images" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {history.nidImageName && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            NID / ID Card
                          </p>
                          <ImagePreviewCell
                            imageId={history.nidImageName}
                            label="NID / ID Card"
                            className="w-full h-64 rounded-lg object-cover"
                          />
                        </div>
                      )}
                      {history.selfieImageName && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Selfie Photo
                          </p>
                          <ImagePreviewCell
                            imageId={history.selfieImageName}
                            label="Selfie Photo"
                            className="w-full h-64 rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* ── Customer Profile ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Customer Profile" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Legal ID" value={history.customerInfo.legalId} />
                  <InfoRow label="Given Name" value={history.customerInfo.givenName} />
                  <InfoRow label="Family Name" value={history.customerInfo.familyName} />
                  <InfoRow label="Khmer Name" value={`${history.customerInfo.firstNameKh || ""} ${history.customerInfo.lastNameKh || ""}`.trim() || undefined} />
                  <InfoRow label="Phone" value={history.customerInfo.phoneNumber} />
                  <InfoRow label="Gender" value={history.customerInfo.gender} />
                  <InfoRow label="Date of Birth" value={history.customerInfo.dateOfBirth} />
                  <InfoRow label="Nationality" value={history.customerInfo.nationality} />
                  <InfoRow label="Issued Date" value={history.customerInfo.issuedDate} />
                  <InfoRow label="Expired Date" value={history.customerInfo.expiredDate} />
                  <InfoRowFull label="Legal Address" value={history.customerInfo.legalAddress} />
                </div>
              </div>

              <Separator />

              {/* ── Personal & KYC ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Personal & KYC" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Marital Status" value={history.maritalStatus} />
                  <InfoRow label="Branch" value={history.branch} />
                  <InfoRow label="Occupation Code" value={history.occupationCode} />
                  <InfoRow label="Occupation Status" value={history.occupationStatus} />
                  <InfoRow label="Address Code" value={history.currentAddressCode} />
                  <InfoRow label="POB Code" value={history.placeOfBirthCode} />
                  <InfoRowFull label="Current Address" value={history.currentAddressName} />
                  <InfoRowFull label="Place of Birth" value={history.placeOfBirthName} />
                  <InfoRowFull label="Remarks" value={history.remarks || "No remarks"} />
                </div>
              </div>

              <Separator />

              {/* ── Screening Results ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Screening Results" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    label="Risk Level"
                    value={
                      history.riskLevel ? (
                        <Badge variant={history.riskLevel === "HIGH" ? "destructive" : "default"}>
                          {history.riskLevel}
                        </Badge>
                      ) : undefined
                    }
                  />
                  <InfoRow label="Action Taken" value={history.actionTaken} />
                  <InfoRow label="Service Name" value={history.serviceName} />
                  <InfoRow label="Total Rule Score" value={history.totalRulesScore} />
                </div>
              </div>

              <Separator />

              {/* ── Audit Trail ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Audit Trail" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Created At" value={DateTimeFormat(history.createdAt)} />
                  <InfoRow label="Updated At" value={DateTimeFormat(history.updatedAt)} />
                </div>

                {history.approvedBy && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" /> Approved By
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={history.approvedBy.fullName} />
                      <InfoRow label="Email" value={history.approvedBy.email} />
                      <InfoRow label="Role" value={<Badge variant="outline">{getRoleDisplayName(history.approvedBy.userRole)}</Badge>} />
                      <InfoRow label="Position" value={history.approvedBy.position} />
                    </div>
                  </div>
                )}

                {history.rejectedBy && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Rejected By
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={history.rejectedBy.fullName} />
                      <InfoRow label="Email" value={history.rejectedBy.email} />
                      <InfoRow label="Role" value={<Badge variant="outline">{getRoleDisplayName(history.rejectedBy.userRole)}</Badge>} />
                      <InfoRow label="Position" value={history.rejectedBy.position} />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
