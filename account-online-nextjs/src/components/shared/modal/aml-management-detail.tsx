"use client";

import {
  User,
  Shield,
  Activity,
  Layers,
  Briefcase,
  ClipboardCheck,
  FileText,
  FileClock,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AmlManagementModel } from "@/models/aml/management/response/aml-management.response";
import { getAmlManagementByIdService } from "@/services/dashboard/aml/aml-management.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "../badge/aml-badge";
import { getRoleDisplayName } from "@/utils/role-display";

interface AmlAlertViewModalProps {
  alert?: AmlManagementModel;
  alertId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AmlViewDetailModal({
  alert: initialAlert,
  alertId,
  isOpen,
  onClose,
}: AmlAlertViewModalProps) {
  const [alert, setAlert] = useState<AmlManagementModel | undefined>(
    initialAlert,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialAlert) {
      setAlert(initialAlert);
      return;
    }

    if (alertId) {
      const fetchAlert = async () => {
        setLoading(true);
        try {
          const data = await getAmlManagementByIdService(alertId);
          setAlert(data);
        } catch (err) {
          console.error("Failed to fetch AML alert:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAlert();
    }
  }, [alertId, initialAlert, isOpen]);

  const handleClose = () => onClose();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Shield className="w-6 h-6 text-foreground" />
            </div>

            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                AML Alert Details
              </DialogTitle>

              <DialogDescription className="text-base text-muted-foreground">
                Transaction: {alert?.trxnID}
              </DialogDescription>

              {/* Status Badge */}
              {alert && (
                <div className="mt-2">
                  <AmlStatusBadge status={alert.status} />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading AML alert...
              </div>
            ) : !alert ? (
              <div className="text-center text-muted-foreground">
                No AML alert data available
              </div>
            ) : (
              <>
                {/* 1. Customer Information */}
                <Section
                  title="Customer Profile"
                  icon={<User className="h-5 w-5" />}
                >
                  <InfoRow
                    label="Legal ID"
                    value={alert.customerInfo.legalId}
                  />
                  <InfoRow
                    label="Given Name"
                    value={alert.customerInfo.givenName}
                  />
                  <InfoRow
                    label="Family Name"
                    value={alert.customerInfo.familyName}
                  />
                  <InfoRow
                    label="Khmer Name"
                    value={`${alert.customerInfo.firstNameKh} ${alert.customerInfo.lastNameKh}`}
                  />
                  <InfoRow
                    label="Phone"
                    value={alert.customerInfo.phoneNumber}
                  />
                  <InfoRow label="Gender" value={alert.customerInfo.gender} />
                  <InfoRow
                    label="Date of Birth"
                    value={alert.customerInfo.dateOfBirth}
                  />
                  <InfoRow
                    label="Nationality"
                    value={alert.customerInfo.nationality}
                  />
                  <InfoRow
                    label="Legal Address"
                    value={alert.customerInfo.legalAddress}
                    className="md:col-span-2"
                  />
                  <InfoRow
                    label="Issued Date"
                    value={alert.customerInfo.issuedDate}
                  />
                  <InfoRow
                    label="Expired Date"
                    value={alert.customerInfo.expiredDate}
                  />
                </Section>

                <Section
                  title="Personal & KYC"
                  icon={<Briefcase className="h-5 w-5" />}
                >
                  <InfoRow
                    label="Current Address"
                    value={alert.currentAddressName}
                    className="md:col-span-2"
                  />
                  <InfoRow
                    label="Address Code"
                    value={
                      alert.currentAddressCode && (
                        <Badge variant="secondary" className="font-mono">
                          {alert.currentAddressCode}
                        </Badge>
                      )
                    }
                  />
                  <InfoRow
                    label="Place of Birth"
                    value={alert.placeOfBirthName}
                    className="md:col-span-2"
                  />
                  <InfoRow
                    label="POB Code"
                    value={
                      alert.placeOfBirthCode && (
                        <Badge variant="secondary" className="font-mono">
                          {alert.placeOfBirthCode}
                        </Badge>
                      )
                    }
                  />
                  <InfoRow label="Marital Status" value={alert.maritalStatus} />
                  <InfoRow
                    label="Occupation Code"
                    value={alert.occupationCode}
                  />
                  <InfoRow
                    label="Occupation Status"
                    value={alert.occupationStatus}
                  />
                  <InfoRow
                    label="Remarks"
                    value={alert.remarks || "No remarks"}
                    className="md:col-span-2 text-muted-foreground"
                  />
                </Section>

                <Section
                  title="Alert Information"
                  icon={<Activity className="h-5 w-5" />}
                >
                  <InfoRow
                    label="Risk Level"
                    value={
                      <Badge
                        variant={
                          alert.riskLevel === "HIGH" ? "destructive" : "default"
                        }
                      >
                        {alert.riskLevel}
                      </Badge>
                    }
                  />
                  <InfoRow label="Action Taken" value={alert.actionTaken} />
                  <InfoRow label="Service Name" value={alert.serviceName} />
                  <InfoRow
                    label="Total Rule Score"
                    value={
                      <span className="font-bold text-lg">
                        {alert.totalRulesScore}
                      </span>
                    }
                  />
                </Section>

                <Section
                  title="Rules Triggered"
                  icon={<Layers className="h-5 w-5" />}
                >
                  <div className="md:col-span-2 space-y-2">
                    {(() => {
                      try {
                        let raw = alert.rulesTriggered ?? "";
                        if (raw.startsWith('"')) raw = JSON.parse(raw);
                        const rules: { RuleName: string }[] = JSON.parse(raw);
                        if (Array.isArray(rules) && rules.length > 0) {
                          return rules.map((rule, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                            >
                              <span className="text-sm font-medium">
                                {rule.RuleName}
                              </span>
                              <Badge variant="destructive">Triggered</Badge>
                            </div>
                          ));
                        }
                      } catch {
                        if (alert.rulesTriggered) {
                          return (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                              <span className="text-sm font-medium">
                                {alert.rulesTriggered}
                              </span>
                              <Badge variant="destructive">Triggered</Badge>
                            </div>
                          );
                        }
                      }
                      return (
                        <p className="text-muted-foreground italic text-sm">
                          No rules triggered
                        </p>
                      );
                    })()}
                  </div>
                </Section>

                <Section
                  title="Audit Trail"
                  icon={<FileClock className="h-5 w-5" />}
                >
                  <InfoRow
                    label="Created At"
                    value={DateTimeFormat(alert.createdAt)}
                  />
                  <InfoRow
                    label="Updated At"
                    value={DateTimeFormat(alert.updatedAt)}
                  />

                  {alert.approvedBy && (
                    <div className="md:col-span-2 mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3 text-green-600 flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" /> Approved By
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UserInfoRows data={alert.approvedBy} />
                      </div>
                    </div>
                  )}

                  {alert.rejectedBy && (
                    <div className="md:col-span-2 mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3 text-destructive flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Rejected By
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UserInfoRows data={alert.rejectedBy} />
                      </div>
                    </div>
                  )}
                </Section>

                <Section
                  title="Customer Documents"
                  icon={<FileText className="h-5 w-5" />}
                >
                  <div className="md:col-span-2">
                    <div className="flex md:flex-row flex-col justify-evenly items-center gap-4 p-2">
                      <DocumentCard
                        title="National ID"
                        imageName={alert.nidImageName}
                        imageType="nid"
                        legalId={alert.customerInfo.legalId}
                      />
                      <DocumentCard
                        title="Selfie"
                        imageName={alert.selfieImageName}
                        imageType="selfie"
                        legalId={alert.customerInfo.legalId}
                      />
                    </div>
                  </div>
                </Section>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Section = ({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 ${className}`}
  >
    <div className="flex items-center gap-2 pb-2 border-b">
      {icon && <div className="text-primary">{icon}</div>}
      <h3 className="text-lg font-semibold leading-none tracking-tight">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
      {children}
    </div>
  </div>
);

const InfoRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </Label>
    <div className="text-sm font-medium break-words text-foreground">
      {value ?? <span className="text-muted-foreground/40 italic">N/A</span>}
    </div>
  </div>
);

const UserInfoRows = ({ data }: { data: any }) => (
  <>
    <InfoRow label="Full Name" value={data.fullName} />
    <InfoRow label="Email" value={data.email} />
    <InfoRow
      label="Role"
      value={
        <Badge variant="outline">{getRoleDisplayName(data.userRole)}</Badge>
      }
    />
    <InfoRow label="Position" value={data.position} />
    <InfoRow label="Permission" value={data.userPermission} />
  </>
);

/* ---------------------------------------------
 * DOCUMENT CARD
 * -------------------------------------------*/
/* ---------------------------------------------
 * DOCUMENT CARD
 * -------------------------------------------*/
/* ---------------------------------------------
 * DOCUMENT CARD
 * -------------------------------------------*/
function DocumentCard({
  title,
  imageName,
  imageType,
  legalId,
}: {
  title: string;
  imageName?: string;
  imageType: "nid" | "selfie";
  legalId?: string;
}) {
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE ?? "";

  const getImageUrl = (filename: string | undefined | null): string | null => {
    if (!filename) return null;
    return `${IMAGE_BASE_URL}/api/customer-images/${filename}`;
  };

  /* ---------------------------------------------
   * STATE & EFFECT FOR IMAGE
   * -------------------------------------------*/
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageName) {
      setLoadedSrc(null);
      return;
    }

    const fetchImage = async () => {
      try {
        const url = getImageUrl(imageName);
        if (url) {
          setLoadedSrc(url);
        } else {
          setLoadedSrc(null);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setLoadedSrc(null);
      }
    };

    fetchImage();
  }, [imageName]);

  const handleDownload = async () => {
    if (!imageName || !legalId) return alert("No image to download");
    try {
      const url = `${IMAGE_BASE_URL}/api/customer-images/${imageName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const extension = blob.type.replace("image/", "") || "jpg";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${legalId}_${imageType}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="w-full group relative rounded-lg border bg-background shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
        <p className="text-white font-medium text-sm drop-shadow-sm">{title}</p>
      </div>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleDownload();
        }}
        className="block aspect-video relative"
      >
        <div className="w-full h-full bg-muted flex items-center justify-center">
          {loadedSrc ? (
            <img
              src={loadedSrc}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs">Loading...</span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
          <div className="bg-background/90 text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            Download Image
          </div>
        </div>
      </a>
    </div>
  );
}
