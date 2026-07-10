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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AmlManagementModel } from "@/models/aml/management/response/aml-management.response";
import { getAmlManagementByIdService } from "@/services/dashboard/aml/aml-management.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "../badge/aml-badge";
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
      <DialogContent className="sm:max-w-[850px] h-[92vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Shield className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">AML Alert Details</DialogTitle>
              <DialogDescription className="sr-only">AML Alert Details</DialogDescription>
              {alert && <div className="mt-1"><AmlStatusBadge status={alert.status} /></div>}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading AML alert...</div>
            ) : !alert ? (
              <div className="text-center py-8 text-muted-foreground">No AML alert data available</div>
            ) : (
              <div className="space-y-6">

                {/* ── Document Images ── */}
                {(alert.nidImageName || alert.selfieImageName) && (
                  <>
                    <div className="space-y-4">
                      <SectionHeader color="bg-teal-600" title="Document Images" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {alert.nidImageName && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">NID / ID Card</p>
                            <ImagePreviewCell imageId={alert.nidImageName} label="NID / ID Card" className="w-full h-64" />
                          </div>
                        )}
                        {alert.selfieImageName && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selfie Photo</p>
                            <ImagePreviewCell imageId={alert.selfieImageName} label="Selfie Photo" className="w-full h-64" />
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
                  <SectionHeader color="bg-purple-600" title="Personal & KYC" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Marital Status" value={alert.maritalStatus} />
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
                  <SectionHeader color="bg-orange-600" title="Alert Information" />
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
                  <SectionHeader color="bg-gray-600" title="Audit Trail" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Created At" value={DateTimeFormat(alert.createdAt)} />
                    <InfoRow label="Updated At" value={DateTimeFormat(alert.updatedAt)} />

                    {alert.approvedBy && (
                      <div className="md:col-span-2 pt-4 border-t space-y-4">
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
                      <div className="md:col-span-2 pt-4 border-t space-y-4">
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

              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
