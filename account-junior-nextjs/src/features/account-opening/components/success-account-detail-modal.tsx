"use client";

import type React from "react";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { toProperCase } from "@/utils/common/common";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface SuccessAccountDetailModalProps {
  account?: any;
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

export default function SuccessAccountViewModal({
  account,
  isOpen,
  onClose,
}: SuccessAccountDetailModalProps) {
  if (!account) return null;

  const a = account as any;

  // Safely parse requestPayload fallback if present
  let p: any = {};
  if (a.requestPayload) {
    try {
      p = typeof a.requestPayload === "string" ? JSON.parse(a.requestPayload) : a.requestPayload;
    } catch (_) {}
  }

  const getVal = (key: string, ...aliases: string[]) => {
    if (a[key] && a[key] !== "N/A" && a[key] !== "") return a[key];
    for (const al of aliases) {
      if (a[al] && a[al] !== "N/A" && a[al] !== "") return a[al];
      if (p[al] && p[al] !== "N/A" && p[al] !== "") return p[al];
    }
    if (p[key] && p[key] !== "N/A" && p[key] !== "") return p[key];
    return undefined;
  };

  // Name fields — support both account-online (legalFirstNameEn/legalLastNameEn) and junior (givenName/familyName)
  const givenName   = getVal("givenName", "legalFirstNameEn", "firstNameEn", "given_name");
  const familyName  = getVal("familyName", "legalLastNameEn", "lastNameEn", "family_name");
  const firstNameKh = getVal("firstNameKh", "legalFirstNameKh", "first_name_kh");
  const lastNameKh  = getVal("lastNameKh", "legalLastNameKh", "last_name_kh");
  const holderName  = a.legalHolderName || `${familyName} ${givenName}`.trim() || `${lastNameKh} ${firstNameKh}`.trim();

  // Date of birth / issued / expired
  const dateOfBirth = getVal("dateOfBirth", "legalDateOfBirth", "dob", "date_of_birth");
  const issuedDate  = getVal("issuedDate", "legalIssueDate", "legalIssuedDate", "legal_iss_date");
  const expiredDate = getVal("expiredDate", "legalExpireDate", "legalExpiredDate", "legal_exp_date");
  const gender      = getVal("gender", "legalGender");

  // Location fields with payload fallbacks
  const province  = getVal("customerProvince", "customerProvinceKh", "customerProvinceEn", "customerCurrentProvince", "customer_province_kh", "customer_province_en");
  const district  = getVal("customerDistrict", "customerDistrictKh", "customerDistrictEn", "customerCurrentDistrict", "customer_district_kh", "customer_district_en");
  const commune   = getVal("customerCommune", "customerCommuneKh", "customerCommuneEn", "customerCurrentCommune", "customer_commune_kh", "customer_commune_en");
  const village   = getVal("customerVillage", "customerVillageKh", "customerVillageEn", "customerCurrentVillage", "customer_village_kh", "customer_village_en");

  const pobProvince = getVal("customerPobProvince", "customerPobProvinceKh", "customerPobProvinceEn", "customerPobProvince", "customer_pob_province_kh", "customer_pob_province_en");
  const pobDistrict = getVal("customerPobDistrict", "customerPobDistrictKh", "customerPobDistrictEn", "customerPobDistrict", "customer_pob_district_kh", "customer_pob_district_en");
  const pobCommune  = getVal("customerPobCommune", "customerPobCommuneKh", "customerPobCommuneEn", "customerPobCommune", "customer_pob_commune_kh", "customer_pob_commune_en");
  const pobVillage  = getVal("customerPobVillage", "customerPobVillageKh", "customerPobVillageEn", "customerPobVillage", "customer_pob_village_kh", "customer_pob_village_en");

  // Image
  const hasNid    = a.hasNid !== false && p.has_nid !== false && String(a.hasNid) !== "false";
  const docImage  = a.nidImageName || a.referenceDocName || p.nid_image_name || p.reference_doc_name;
  const selfieImg = a.selfieImageName || p.selfie_image_name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl sm:max-w-5xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">

        {/* ── Header ── */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-semibold">
                  Junior Account Details
                </DialogTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  Junior Account
                </span>
              </div>
              <DialogDescription className="text-base text-muted-foreground mt-0.5">
                {holderName
                  ? `Details for "${toProperCase(holderName)}"`
                  : a.cif
                  ? `CIF: ${a.cif}`
                  : "Account information"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ── Document Images ── */}
            {(docImage || selfieImg) && (
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
                    {selfieImg && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Selfie Photo
                        </p>
                        <ImagePreviewCell
                          imageId={selfieImg}
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

            {/* ── Account Information ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Account Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="CIF"
                  value={
                    a.cif ? (
                      <span className="font-mono font-bold text-teal-700">{a.cif}</span>
                    ) : undefined
                  }
                />
                <InfoRow
                  label="KHR Account"
                  value={
                    a.khrAccount ? (
                      <span className="font-mono font-bold text-emerald-700">
                        {a.khrAccount}
                      </span>
                    ) : undefined
                  }
                />
                <InfoRow
                  label="USD Account"
                  value={
                    a.usdAccount ? (
                      <span className="font-mono font-bold text-blue-700">
                        {a.usdAccount}
                      </span>
                    ) : undefined
                  }
                />
                <InfoRow label="Mnemonic" value={a.mnemonic} />
                <InfoRow label="Category Account" value="CPBank Junior Savings" />
                <InfoRow label="Branch Code" value={a.branchCode} />
                <InfoRow label="Branch Name" value={a.branchNameKh || a.branchCode} />
                <InfoRow label="Staff Referral Code" value={a.referralId} />
                <InfoRow label="MB Activation Code" value={a.mbActivationCode} />
              </div>
            </div>

            <Separator />

            {/* ── Child / Junior Information ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Child / Junior Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Holder Name"      value={toProperCase(holderName)} />
                {hasNid ? (
                  <InfoRow label="National NID Number" value={a.legalId} />
                ) : (
                  <>
                    <InfoRow label="Guardian NID (Parent NID)" value={a.guardianLegalId || "N/A"} />
                    <InfoRow label="Ref Doc Number" value={a.referenceDocName || a.legalId} />
                    <InfoRow label="Ref Doc Type"   value={a.referenceDocType || "Birth Certificate"} />
                  </>
                )}
                <InfoRow label="First Name (EN)"  value={toProperCase(givenName)} />
                <InfoRow label="Last Name (EN)"   value={toProperCase(familyName)} />
                <InfoRow label="First Name (KH)"  value={firstNameKh} />
                <InfoRow label="Last Name (KH)"   value={lastNameKh} />
                <InfoRow label="Date of Birth"    value={dateOfBirth} />
                <InfoRow label="Gender"           value={gender} />
                <InfoRow label="Phone Number"     value={a.phoneNumber} />
                <InfoRow label="Marital Status"   value={a.maritalStatus || "SINGLE"} />
                <InfoRow label="Nationality"      value={a.nationality || "KH"} />
                <InfoRow label="Issued Date"      value={issuedDate} />
                <InfoRow label="Expired Date"     value={expiredDate} />
                <InfoRow label="Occupation"       value={a.occupation || a.occupationStatus || "STUDENT / សិស្ស"} />
                {/* Province / District / Commune / Village */}
                <InfoRow label="Province"         value={province} />
                <InfoRow label="District"         value={district} />
                <InfoRow label="Commune"          value={commune} />
                <InfoRow label="Village"          value={village} />
                <InfoRowFull label="Full Address"
                  value={a.legalAddress || a.currentAddressName} />
                {/* POB */}
                <InfoRow label="POB Province"     value={pobProvince} />
                <InfoRow label="POB District"     value={pobDistrict} />
                <InfoRow label="POB Commune"      value={pobCommune} />
                <InfoRow label="POB Village"      value={pobVillage} />
                <InfoRowFull label="Full Place of Birth"
                  value={a.legalPlaceOfBirth || a.placeOfBirth || a.placeOfBirthName} />
              </div>
            </div>

            {/* ── Parent / Guardian Information ── */}
            {(a.guardianName || a.guardianLegalId) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <SectionHeader color="bg-primary" title="Parent / Guardian Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Guardian Name"     value={a.guardianName} />
                    <InfoRow label="Guardian NID"      value={a.guardianLegalId} />
                    <InfoRow label="Guardian Phone"    value={a.guardianPhone || a.phoneNumber} />
                    <InfoRow label="Relationship"      value={a.guardianRelationship} />
                    <InfoRow label="Guardian CIF"
                      value={
                        a.guardianCif ? (
                          <span className="font-mono font-bold text-teal-700">
                            {a.guardianCif}
                          </span>
                        ) : undefined
                      }
                    />
                    <InfoRowFull label="Guardian Address" value={a.guardianAddress} />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ── System Information ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="System Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Submitted By" value={a.submittedBy || "Customer"} />
                <InfoRow label="Created At"   value={DateTimeFormat(a.createdAt)} />
                <InfoRow label="Updated At"   value={DateTimeFormat(a.updatedAt)} />
              </div>
            </div>

          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
