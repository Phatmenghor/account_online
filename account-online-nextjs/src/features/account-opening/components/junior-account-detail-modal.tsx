"use client";

import type React from "react";
import { Shield, ClipboardCheck } from "lucide-react";
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
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import { getRoleDisplayName } from "@/utils/role-display";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface JuniorAccountViewModalProps {
  /** AML management record (pending list) */
  account?: any;
  /** AML history record — alias for account */
  history?: any;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  const isMissing = !value || value === "N/A" || value === "n/a" || value === "";
  return (
    <div className="flex justify-between border-b pb-2 gap-4">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">
        {isMissing ? (
          <span className="text-muted-foreground/60 font-normal">---</span>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function InfoRowFull({ label, value }: { label: string; value?: React.ReactNode }) {
  const isMissing = !value || value === "N/A" || value === "n/a" || value === "";
  return (
    <div className="flex justify-between border-b pb-2 gap-4 col-span-full">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">
        {isMissing ? (
          <span className="text-muted-foreground/60 font-normal">---</span>
        ) : (
          value
        )}
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

function formatMaritalStatus(val?: string) {
  if (!val || val === "N/A" || val === "n/a") return "SINGLE";
  return String(val).trim().toUpperCase();
}


export default function JuniorAccountViewModal({
  account,
  history,
  isOpen,
  onClose,
}: JuniorAccountViewModalProps) {
  const d = account ?? history;
  if (!d) return null;

  // Safely parse requestPayload fallback if present
  let p: any = {};
  if (d.requestPayload) {
    try {
      p = typeof d.requestPayload === "string" ? JSON.parse(d.requestPayload) : d.requestPayload;
    } catch {}

  }

  const hasNid = d.hasNid !== false && p.has_nid !== false && String(d.hasNid) !== "false";

  // Helper extractor from d -> p -> fallback
  const get = (key: string, ...aliases: string[]) => {
    if (d[key] && d[key] !== "N/A" && d[key] !== "") return d[key];
    for (const a of aliases) {
      if (d[a] && d[a] !== "N/A" && d[a] !== "") return d[a];
      if (p[a] && p[a] !== "N/A" && p[a] !== "") return p[a];
    }
    if (p[key] && p[key] !== "N/A" && p[key] !== "") return p[key];
    return undefined;
  };

  const legalId      = get("legalId", "guardianLegalId", "legal_id");
  const givenName    = get("givenName", "firstNameEn", "given_name");
  const familyName   = get("familyName", "lastNameEn", "family_name", "legalHolderName");
  const firstNameKh  = get("firstNameKh", "first_name_kh");
  const lastNameKh   = get("lastNameKh", "last_name_kh");
  const khmerName    = `${lastNameKh || ""} ${firstNameKh || ""}`.trim() || undefined;

  const phoneNumber  = get("phoneNumber", "phone_number", "sms");
  const gender       = get("gender");
  const dateOfBirth  = get("dateOfBirth", "dob", "date_of_birth");
  const nationality  = get("nationality") || "KH";
  const issuedDate   = get("issuedDate", "legalIssueDate", "legal_iss_date");
  const expiredDate  = get("expiredDate", "legalExpireDate", "legal_exp_date");
  const branch       = get("branch", "branchCode", "branch_code");
  const maritalStatus= formatMaritalStatus(get("maritalStatus", "marital_status"));

  // Address resolution
  const addressCode = get("currentAddressCode", "cust_province", "customerCurrentProvince", "customerProvinceCode", "customer_province_code") ||
    ([p.customerCurrentProvince || p.customerProvinceCode || p.cust_province, p.customerCurrentDistrict || p.customerDistrictCode || p.cust_district, p.customerCurrentCommune || p.customerCommuneCode || p.cust_commune, p.customerCurrentVillage || p.customerVillageCode || p.cust_village].filter(Boolean).join(", ") || undefined);

  const currentAddressName = get("currentAddressName", "legalAddress", "address");

  const pobCode = get("placeOfBirthCode", "cust_pob_province", "customerPobProvince", "customerPobProvinceCode", "customer_pob_province_code") ||
    ([p.customerPobProvince || p.customerPobProvinceCode || p.cust_pob_province, p.customerPobDistrict || p.customerPobDistrictCode || p.cust_pob_district, p.customerPobCommune || p.customerPobCommuneCode || p.cust_pob_commune, p.customerPobVillage || p.customerPobVillageCode || p.cust_pob_village].filter(Boolean).join(", ") || undefined);

  const placeOfBirthName = get("placeOfBirthName", "placeOfBirth", "place_of_birth");

  // Occupation
  const rawOccupation = get("occupationCode", "occupation");
  const occupationCode = rawOccupation || "320";
  const rawStatus = get("occupationStatus");
  const occupationStatus = (rawStatus && rawStatus !== "320" && rawStatus !== "STUDENT")
    ? rawStatus
    : "STUDENT / សិស្ស";


  // Guardian fields
  const guardianName         = get("guardianName", "guardian_name");
  const guardianLegalId      = get("guardianLegalId", "guardian_legal_id");
  const guardianPhone        = get("guardianPhone", "guardian_phone");
  const guardianRelationship = get("guardianRelationship", "guardian_relationship");
  const guardianCif          = get("guardianCif", "guardian_cif");
  const guardianAddress      = get("guardianAddress", "guardian_address");

  // Images
  const docImage   = d.nidImageName || d.referenceDocName || p.nid_image_name || p.reference_doc_name;
  const selfieImage = d.selfieImageName || p.selfie_image_name;

  // Screening Results
  const riskLevel: string = get("amlExternalRiskLevel", "riskLevel", "amlRiskLevel") || "";
  const riskVariant: "destructive" | "default" = riskLevel === "HIGH" ? "destructive" : "default";
  const actionTaken    = get("amlExternalActionTaken", "actionTaken");
  const serviceName    = get("amlExternalServiceName", "serviceName");
  const totalRulesScore= get("amlExternalTotalRulesScore", "totalRulesScore");
  const trxnID         = get("amlExternalTrxnID", "trxnID");

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
              <DialogTitle className="text-lg font-semibold">
                Junior AML {d.status === "PENDING" ? "Alert" : "History"} Details
              </DialogTitle>
              <DialogDescription className="sr-only">
                Junior AML {d.status === "PENDING" ? "Alert" : "History"} Details
              </DialogDescription>
              {d && <div className="mt-1"><AmlStatusBadge status={d.status} /></div>}
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ── Document Images ── */}
            {(docImage || selfieImage) && (
              <>
                <div className="space-y-4">
                  <SectionHeader color="bg-primary" title="Document Images" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {docImage && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {hasNid ? "NID / ID Card" : "Birth Certificate / Reference Doc"}
                        </p>
                        <ImagePreviewCell
                          imageId={docImage}
                          label={hasNid ? "NID / ID Card" : "Birth Certificate"}
                          className="w-full h-64 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    {selfieImage && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Selfie Photo
                        </p>
                        <ImagePreviewCell
                          imageId={selfieImage}
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

            {/* ── Child / Junior Profile ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Child / Junior Profile" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasNid ? (
                  <InfoRow label="Legal ID" value={legalId} />
                ) : (
                  <InfoRow label="Guardian NID (Parent NID)" value={guardianLegalId || legalId} />
                )}
                <InfoRow label="Given Name"    value={givenName} />
                <InfoRow label="Family Name"   value={familyName} />
                <InfoRow label="Khmer Name"    value={khmerName} />
                <InfoRow label="Phone"         value={phoneNumber} />
                <InfoRow label="Gender"        value={gender} />
                <InfoRow label="Date of Birth" value={dateOfBirth} />
                <InfoRow label="Nationality"   value={nationality} />
                <InfoRow label="Issued Date"   value={issuedDate} />
                <InfoRow label="Expired Date"  value={expiredDate} />
                <InfoRowFull label="Legal Address" value={currentAddressName} />
              </div>
            </div>

            <Separator />

            {/* ── Personal & KYC ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Personal & KYC" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Marital Status"    value={maritalStatus} />
                <InfoRow label="Branch"            value={branch} />
                <InfoRow label="Occupation Code"   value={occupationCode} />
                <InfoRow label="Occupation Status" value={occupationStatus} />
                <InfoRow label="Address Code"      value={addressCode} />
                <InfoRow label="POB Code"          value={pobCode} />
                <InfoRowFull label="Current Address"  value={currentAddressName} />
                <InfoRowFull label="Place of Birth"   value={placeOfBirthName} />
                <InfoRowFull label="Remarks"          value={d.remarks || p.remarks || "No remarks"} />
              </div>
            </div>

            {/* ── Parent / Guardian Information ── */}
            {(guardianName || guardianLegalId || !hasNid) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <SectionHeader color="bg-primary" title="Parent / Guardian Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Guardian Name"     value={guardianName} />
                    <InfoRow label="Guardian NID"      value={guardianLegalId} />
                    <InfoRow label="Guardian Phone"    value={guardianPhone || phoneNumber} />
                    <InfoRow label="Relationship"      value={guardianRelationship} />
                    <InfoRow
                      label="Guardian CIF"
                      value={
                        guardianCif ? (
                          <span className="font-mono font-bold text-teal-700">
                            {guardianCif}
                          </span>
                        ) : undefined
                      }
                    />
                    <InfoRowFull label="Guardian Address" value={guardianAddress} />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ── Screening Results ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Screening Results" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Risk Level"
                  value={
                    riskLevel ? (
                      <Badge variant={riskVariant}>{riskLevel}</Badge>
                    ) : undefined
                  }
                />
                <InfoRow label="Action Taken"    value={actionTaken} />
                <InfoRow label="Service Name"    value={serviceName} />
                <InfoRow label="Total Rule Score" value={totalRulesScore} />
                <InfoRow label="Transaction ID"  value={trxnID} />
              </div>
            </div>

            <Separator />

            {/* ── Audit Trail ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Audit Trail" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Submitted By" value={d.submittedBy || "Customer"} />
                <InfoRow label="Created At"   value={DateTimeFormat(d.createdAt)} />
                <InfoRow label="Updated At"   value={DateTimeFormat(d.updatedAt)} />
              </div>

              {d.approvedBy && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" /> Approved By
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Full Name" value={d.approvedBy.fullName} />
                    <InfoRow label="Email"     value={d.approvedBy.email} />
                    <InfoRow label="Role"      value={<Badge variant="outline">{getRoleDisplayName(d.approvedBy.userRole)}</Badge>} />
                    <InfoRow label="Position"  value={d.approvedBy.position} />
                  </div>
                </div>
              )}

              {d.rejectedBy && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Rejected By
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Full Name" value={d.rejectedBy.fullName} />
                    <InfoRow label="Email"     value={d.rejectedBy.email} />
                    <InfoRow label="Role"      value={<Badge variant="outline">{getRoleDisplayName(d.rejectedBy.userRole)}</Badge>} />
                    <InfoRow label="Position"  value={d.rejectedBy.position} />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
