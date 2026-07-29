"use client";

import type React from "react";
import { User, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Separator } from "@/components/ui/separator";
import { toProperCase } from "@/utils/common/common";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface JuniorAccountViewModalProps {
  account?: any;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 gap-4">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">{value || "N/A"}</span>
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

export default function JuniorAccountViewModal({
  account,
  isOpen,
  onClose,
}: JuniorAccountViewModalProps) {
  if (!account) return null;

  const hasNid = account.hasNid !== false && String(account.hasNid) !== "false";
  const childNameKh = `${account.legalLastNameKh || ""} ${account.legalFirstNameKh || ""}`.trim();
  const childNameEn = `${account.legalLastNameEn || ""} ${account.legalFirstNameEn || ""}`.trim();
  const displayName = account.legalHolderName || childNameEn || childNameKh || "Junior Customer";

  const docImage = account.nidImageName || account.referenceDocName;
  const selfieImage = account.selfieImageName;

  // Format Address with slash separation
  const formatAddress = (addr?: string) => {
    if (!addr || addr === "N/A") return "N/A";
    return addr.split(/,|\s{2,}/).map(s => s.trim()).filter(Boolean).join(" / ");
  };

  const formattedLegalAddress = formatAddress(account.legalAddress);
  const formattedPob = formatAddress(account.legalPlaceOfBirth);

  const addressCodes = [
    account.customerVillageCode,
    account.customerCommuneCode,
    account.customerDistrictCode,
    account.customerProvinceCode
  ].filter(Boolean).join(" / ");

  const pobCodes = [
    account.customerPobVillageCode,
    account.customerPobCommuneCode,
    account.customerPobDistrictCode,
    account.customerPobProvinceCode
  ].filter(Boolean).join(" / ");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl sm:max-w-5xl w-full max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-semibold">
                  Account Online Details
                </DialogTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  Junior Account
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    hasNid
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {hasNid ? "WITH NID MODE" : "NO NID MODE"}
                </span>
              </div>
              <DialogDescription className="text-base text-muted-foreground mt-0.5">
                {displayName
                  ? `Details for "${toProperCase(displayName)}"`
                  : account?.cif
                  ? `CIF: ${account.cif}`
                  : "Account information"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* ── 1. Document Images ── */}
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
                          className="w-full h-64"
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
                          className="w-full h-64"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* ── 2. Core Banking Account Information ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Account Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="CIF" value={account.cif} />
                <InfoRow label="KHR Account" value={account.khrAccount} />
                <InfoRow label="USD Account" value={account.usdAccount} />
                <InfoRow label="Mnemonic" value={account.mnemonic} />
                <InfoRow label="Category Account" value={account.categoryAccount || "CPBank Junior Savings"} />
                <InfoRow label="Branch Code" value={account.branchCode} />
                <InfoRow label="Branch Name" value={account.branchNameKh || account.branchName} />
                <InfoRow label="Staff Referral Code" value={account.staffCode || account.referralCode || account.referralId} />
              </div>
            </div>

            <Separator />

            {/* ── 3. Child Personal Information ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="Child / Junior Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Holder Name" value={toProperCase(childNameEn || account.legalHolderName)} />
                {hasNid ? (
                  <InfoRow label="National NID Number" value={account.legalId} />
                ) : (
                  <>
                    <InfoRow label="Ref Doc Number" value={account.legalId || account.referenceDocName} />
                    <InfoRow label="Ref Doc Type" value={account.referenceDocType || account.legalDocName || "Birth Certificate"} />
                  </>
                )}
                <InfoRow label="First Name (EN)" value={toProperCase(account.legalFirstNameEn)} />
                <InfoRow label="Last Name (EN)" value={toProperCase(account.legalLastNameEn)} />
                <InfoRow label="First Name (KH)" value={account.legalFirstNameKh} />
                <InfoRow label="Last Name (KH)" value={account.legalLastNameKh} />
                <InfoRow label="Date of Birth" value={account.legalDateOfBirth || account.dob} />
                <InfoRow label="Gender" value={account.legalGender || account.gender} />
                <InfoRow label="Phone Number" value={account.phoneNumber || account.guardianPhone} />
                <InfoRow label="Marital Status" value={account.maritalStatus || "SINGLE"} />
                <InfoRow label="Nationality" value={account.nationality || "KH"} />
                <InfoRow label="Occupation" value={account.occupation || "320"} />

                <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground shrink-0">Full Address:</Label>
                  <span className="text-sm font-semibold text-right">{formattedLegalAddress}</span>
                </div>
                {addressCodes && (
                  <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground shrink-0">Full Address Code:</Label>
                    <span className="text-sm font-mono font-semibold text-right text-teal-700 dark:text-teal-400">{addressCodes}</span>
                  </div>
                )}

                <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground shrink-0">Full Place of Birth:</Label>
                  <span className="text-sm font-semibold text-right">{formattedPob}</span>
                </div>
                {pobCodes && (
                  <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground shrink-0">Full POB Code:</Label>
                    <span className="text-sm font-mono font-semibold text-right text-teal-700 dark:text-teal-400">{pobCodes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── 4. Parent / Guardian Information (ONLY FOR NO-NID MODE) ── */}
            {!hasNid && (
              <>
                <Separator />
                <div className="space-y-4">
                  <SectionHeader color="bg-primary" title="Parent / Guardian Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Guardian Name" value={account.guardianName} />
                    <InfoRow label="Guardian NID" value={account.guardianLegalId || account.guardianNid} />
                    <InfoRow label="Guardian Phone" value={account.guardianPhone || account.phoneNumber} />
                    <InfoRow label="Relationship" value={account.guardianRelationship || "Parent / Legal Guardian"} />
                    <InfoRow
                      label="Guardian CIF Link"
                      value={
                        account.guardianCif ? (
                          <span className="font-mono font-bold text-teal-700">
                            {account.guardianCif} (Linked JOINT.OWNER)
                          </span>
                        ) : (
                          <span className="text-amber-700 text-xs font-semibold">Will Link Parent CIF</span>
                        )
                      }
                    />
                    <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground shrink-0">Guardian Address:</Label>
                      <span className="text-sm font-semibold text-right">{formatAddress(account.guardianAddress)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ── 5. System Information ── */}
            <div className="space-y-4">
              <SectionHeader color="bg-primary" title="System Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Submitted By" value={account.submittedBy || "Customer"} />
                <InfoRow label="Created At" value={DateTimeFormat(account.createdAt)} />
                {account.submittedByUser && (
                  <>
                    <InfoRow label="Staff Name" value={account.submittedByUser.fullName} />
                    <InfoRow label="Staff Email" value={account.submittedByUser.email} />
                    <InfoRow label="Staff Role" value={account.submittedByUser.userRole} />
                    <InfoRow label="Staff Position" value={account.submittedByUser.position} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
