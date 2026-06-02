"use client";

import type React from "react";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SuccessAccountOnlineModel } from "@/models/open-acc-success/success-account-response.model";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Separator } from "@/components/ui/separator";
import { toProperCase } from "@/utils/common/common";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface SuccessAccountViewModalProps {
  account?: SuccessAccountOnlineModel;
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

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1 h-6 ${color} rounded-full`} />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

export default function SuccessAccountViewModal({
  account,
  isOpen,
  onClose,
}: SuccessAccountViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[92vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Success Account Details
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {account?.legalHolderName
                  ? `Details for "${toProperCase(account.legalHolderName)}"`
                  : account?.cif
                  ? `CIF: ${account.cif}`
                  : "Account information"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {account ? (
              <div className="space-y-6">

                {/* ── Document Images ── */}
                {(account.nidImageName || account.selfieImageName) && (
                  <>
                    <div className="space-y-4">
                      <SectionHeader color="bg-teal-600" title="Document Images" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {account.nidImageName && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              NID / ID Card
                            </p>
                            <ImagePreviewCell
                              imageId={account.nidImageName}
                              label="NID / ID Card"
                              className="w-full h-64"
                            />
                          </div>
                        )}
                        {account.selfieImageName && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Selfie Photo
                            </p>
                            <ImagePreviewCell
                              imageId={account.selfieImageName}
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

                {/* ── Account Information ── */}
                <div className="space-y-4">
                  <SectionHeader color="bg-blue-600" title="Account Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="CIF" value={account.cif} />
                    <InfoRow label="KHR Account" value={account.khrAccount} />
                    <InfoRow label="USD Account" value={account.usdAccount} />
                    <InfoRow label="Mnemonic" value={account.mnemonic} />
                    <InfoRow label="MB Activation Code" value={account.mbActivationCode} />
                    <InfoRow
                      label="MB App Download"
                      value={
                        account.mbAppDownloadLink ? (
                          <a
                            href={account.mbAppDownloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {account.mbAppDownloadLink}
                          </a>
                        ) : undefined
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* ── Personal Information (merged with employment, address, pob, branch) ── */}
                <div className="space-y-4">
                  <SectionHeader color="bg-purple-600" title="Personal Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Holder Name" value={toProperCase(account.legalHolderName)} />
                    <InfoRow label="Legal ID" value={account.legalId} />
                    <InfoRow label="Doc Type" value={account.legalDocName} />
                    <InfoRow label="First Name (EN)" value={toProperCase(account.legalFirstNameEn)} />
                    <InfoRow label="Last Name (EN)" value={toProperCase(account.legalLastNameEn)} />
                    <InfoRow label="First Name (KH)" value={account.legalFirstNameKh} />
                    <InfoRow label="Last Name (KH)" value={account.legalLastNameKh} />
                    <InfoRow label="Date of Birth" value={account.legalDateOfBirth} />
                    <InfoRow label="Gender" value={account.legalGender} />
                    <InfoRow label="Marital Status" value={account.maritalStatus} />
                    <InfoRow label="Nationality" value={account.nationality} />
                    <InfoRow label="Phone Number" value={account.phoneNumber} />
                    <InfoRow label="Issued Date" value={account.legalIssuedDate} />
                    <InfoRow label="Expired Date" value={account.legalExpiredDate} />
                    <InfoRow label="Company Name" value={account.companyName} />
                    <InfoRow label="Occupation" value={account.occupation} />
                    <InfoRow label="Branch Code" value={account.branchCode} />
                    <InfoRow label="Branch Name" value={account.branchNameKh} />
                    {/* Address */}
                    <InfoRow label="Province" value={account.customerProvince} />
                    <InfoRow label="District" value={account.customerDistrict} />
                    <InfoRow label="Commune" value={account.customerCommune} />
                    <InfoRow label="Village" value={account.customerVillage} />
                    <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground shrink-0">Full Address:</Label>
                      <span className="text-sm font-semibold text-right">{account.legalAddress || "N/A"}</span>
                    </div>
                    {/* Place of birth */}
                    <InfoRow label="POB Province" value={account.customerPobProvince} />
                    <InfoRow label="POB District" value={account.customerPobDistrict} />
                    <InfoRow label="POB Commune" value={account.customerPobCommune} />
                    <InfoRow label="POB Village" value={account.customerPobVillage} />
                    <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground shrink-0">Full Place of Birth:</Label>
                      <span className="text-sm font-semibold text-right">{account.legalPlaceOfBirth || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── System Information (no card wrap) ── */}
                <div className="space-y-4">
                  <SectionHeader color="bg-gray-600" title="System Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Submitted By" value={account.submittedBy} />
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
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No account data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
