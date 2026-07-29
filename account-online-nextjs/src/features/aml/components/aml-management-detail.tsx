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
import { AmlManagementModel } from "@/features/aml/types/management/response/aml-management.response";
import { getAmlManagementByIdService } from "@/features/aml/services/aml-management.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import { getRoleDisplayName } from "@/utils/role-display";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface AmlAlertViewModalProps {
  alert?: AmlManagementModel;
  alertId?: number;
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

export default function AmlViewDetailModal({
  alert: initialAlert,
  alertId,
  isOpen,
  onClose,
}: AmlAlertViewModalProps) {
  const [alert, setAlert] = useState<AmlManagementModel | undefined>(initialAlert);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialAlert) { setAlert(initialAlert); return; }
    if (alertId) {
      setLoading(true);
      getAmlManagementByIdService(alertId)
        .then(setAlert)
        .catch((err) => console.error("Failed to fetch AML alert:", err))
        .finally(() => setLoading(false));
    }
  }, [alertId, initialAlert, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl sm:max-w-5xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">

        {/* ── Header ── */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">AML Alert Details</DialogTitle>
              <DialogDescription className="sr-only">AML Alert Details</DialogDescription>
              {alert && <div className="mt-1"><AmlStatusBadge status={alert.status} /></div>}
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading AML alert...</div>
          ) : !alert ? (
            <div className="text-center py-16 text-muted-foreground">No AML alert data available</div>
          ) : (
            <div className="p-6 space-y-6">

              {/* ── Document Images (at top) ── */}
              {(alert.nidImageName || alert.selfieImageName) && (
                <>
                  <div className="space-y-4">
                    <SectionHeader color="bg-primary" title="Document Images" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {alert.nidImageName && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            NID / ID Card
                          </p>
                          <ImagePreviewCell
                            imageId={alert.nidImageName}
                            label="NID / ID Card"
                            className="w-full h-64 rounded-lg object-cover"
                          />
                        </div>
                      )}
                      {alert.selfieImageName && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Selfie Photo
                          </p>
                          <ImagePreviewCell
                            imageId={alert.selfieImageName}
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
                  <InfoRow label="Legal ID" value={alert.customerInfo.legalId} />
                  <InfoRow label="Given Name" value={alert.customerInfo.givenName} />
                  <InfoRow label="Family Name" value={alert.customerInfo.familyName} />
                  <InfoRow label="Khmer Name" value={`${alert.customerInfo.firstNameKh || ""} ${alert.customerInfo.lastNameKh || ""}`.trim() || undefined} />
                  <InfoRow label="Phone" value={alert.customerInfo.phoneNumber} />
                  <InfoRow label="Gender" value={alert.customerInfo.gender} />
                  <InfoRow label="Date of Birth" value={alert.customerInfo.dateOfBirth} />
                  <InfoRow label="Nationality" value={alert.customerInfo.nationality} />
                  <InfoRow label="Issued Date" value={alert.customerInfo.issuedDate} />
                  <InfoRow label="Expired Date" value={alert.customerInfo.expiredDate} />
                  <InfoRowFull label="Legal Address" value={alert.customerInfo.legalAddress} />
                </div>
              </div>

              <Separator />

              {/* ── Personal & KYC ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Personal & KYC" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Marital Status" value={alert.maritalStatus} />
                  <InfoRow label="Branch" value={alert.branch} />
                  <InfoRow label="Occupation Code" value={alert.occupationCode} />
                  <InfoRow label="Occupation Status" value={alert.occupationStatus} />
                  <InfoRow label="Address Code" value={alert.currentAddressCode} />
                  <InfoRow label="POB Code" value={alert.placeOfBirthCode} />
                  <InfoRowFull label="Current Address" value={alert.currentAddressName} />
                  <InfoRowFull label="Place of Birth" value={alert.placeOfBirthName} />
                  <InfoRowFull label="Remarks" value={alert.remarks || "No remarks"} />
                </div>
              </div>

              <Separator />

              {/* ── Alert Information ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Alert Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    label="Risk Level"
                    value={
                      alert.riskLevel ? (
                        <Badge variant={alert.riskLevel === "HIGH" ? "destructive" : "default"}>
                          {alert.riskLevel}
                        </Badge>
                      ) : undefined
                    }
                  />
                  <InfoRow label="Action Taken" value={alert.actionTaken} />
                  <InfoRow label="Service Name" value={alert.serviceName} />
                  <InfoRow label="Total Rule Score" value={alert.totalRulesScore} />
                </div>
              </div>

              <Separator />

              {/* ── Audit Trail ── */}
              <div className="space-y-4">
                <SectionHeader color="bg-primary" title="Audit Trail" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Created At" value={DateTimeFormat(alert.createdAt)} />
                  <InfoRow label="Updated At" value={DateTimeFormat(alert.updatedAt)} />
                </div>

                {alert.approvedBy && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" /> Approved By
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={alert.approvedBy.fullName} />
                      <InfoRow label="Email" value={alert.approvedBy.email} />
                      <InfoRow label="Role" value={<Badge variant="outline">{getRoleDisplayName(alert.approvedBy.userRole)}</Badge>} />
                      <InfoRow label="Position" value={alert.approvedBy.position} />
                    </div>
                  </div>
                )}

                {alert.rejectedBy && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Rejected By
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Full Name" value={alert.rejectedBy.fullName} />
                      <InfoRow label="Email" value={alert.rejectedBy.email} />
                      <InfoRow label="Role" value={<Badge variant="outline">{getRoleDisplayName(alert.rejectedBy.userRole)}</Badge>} />
                      <InfoRow label="Position" value={alert.rejectedBy.position} />
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
