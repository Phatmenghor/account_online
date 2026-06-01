"use client";

import type React from "react";
import { Shield, ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HistoryModel } from "@/models/aml/history/response/history-response.model";
import { getAmlHistoryByIdService } from "@/services/dashboard/aml/aml-history.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "../badge/aml-badge";
import { getRoleDisplayName } from "@/utils/role-display";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface HistoryDetailModalProps {
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
    <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">
        {value || <span className="text-muted-foreground italic font-normal">N/A</span>}
      </span>
    </div>
  );
}

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1 h-6 ${color} rounded-full`} />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

export default function AmlHistoryDetailModal({
  history: initialHistory,
  historyId,
  isOpen,
  onClose,
}: HistoryDetailModalProps) {
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
      <DialogContent className="max-w-5xl h-[92vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Shield className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">AML History Details</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                AML screening result details
              </DialogDescription>
              {history && <div className="mt-2"><AmlStatusBadge status={history.status} /></div>}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading history...</div>
            ) : !history ? (
              <div className="text-center py-8 text-muted-foreground">No history data available</div>
            ) : (
              <div className="space-y-6">

                {/* ── Document Images ── */}
                {(history.nidImageName || history.selfieImageName) && (
                  <>
                    <div className="space-y-4">
                      <SectionHeader color="bg-teal-600" title="Document Images" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {history.nidImageName && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">NID / ID Card</p>
                            <ImagePreviewCell imageId={history.nidImageName} label="NID / ID Card" className="w-full h-64" />
                          </div>
                        )}
                        {history.selfieImageName && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selfie Photo</p>
                            <ImagePreviewCell imageId={history.selfieImageName} label="Selfie Photo" className="w-full h-64" />
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* ── Customer Profile ── */}
                <div className="space-y-4">
                  <SectionHeader color="bg-blue-600" title="Customer Profile" />
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
                  <SectionHeader color="bg-purple-600" title="Personal & KYC" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Marital Status" value={history.maritalStatus} />
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
                  <SectionHeader color="bg-orange-600" title="Screening Results" />
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
                  <SectionHeader color="bg-gray-600" title="Audit Trail" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Created At" value={DateTimeFormat(history.createdAt)} />
                    <InfoRow label="Updated At" value={DateTimeFormat(history.updatedAt)} />

                    {history.approvedBy && (
                      <div className="md:col-span-2 pt-4 border-t space-y-4">
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
                      <div className="md:col-span-2 pt-4 border-t space-y-4">
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

              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
