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
import { ScrollArea } from "@/components/ui/scroll-area";
import { SuccessAccountOnlineModel } from "@/models/open-acc-success/success-account-response.model";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Separator } from "@/components/ui/separator";
import AmlStatusBadge from "../badge/aml-badge";
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
      <span className="text-sm font-semibold text-right">
        {value || "N/A"}
      </span>
    </div>
  );
}

function SectionHeader({
  color,
  title,
}: {
  color: string;
  title: string;
}) {
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
  const handleClose = () => onClose();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl h-[92vh] p-0 gap-0 flex flex-col">
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
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6">
              {account ? (
                <div className="space-y-6">
                  {/* Images Section */}
                  {(account.nidImageName || account.selfieImageName) && (
                    <>
                      <div className="space-y-4">
                        <SectionHeader
                          color="bg-teal-600"
                          title="Document Images"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {account.nidImageName && (
                            <div className="flex flex-col gap-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                NID / ID Card
                              </p>
                              <ImagePreviewCell
                                imageId={account.nidImageName}
                                label="NID / ID Card"
                                className="w-full h-48"
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
                                className="w-full h-48"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Account Information */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-blue-600"
                      title="Account Information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="CIF" value={account.cif} />
                      <InfoRow label="KHR Account" value={account.khrAccount} />
                      <InfoRow label="USD Account" value={account.usdAccount} />
                      <InfoRow label="Mnemonic" value={account.mnemonic} />
                      <InfoRow
                        label="MB Activation Code"
                        value={account.mbActivationCode}
                      />
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

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-purple-600"
                      title="Personal Information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Holder Name"
                        value={toProperCase(account.legalHolderName)}
                      />
                      <InfoRow label="Legal ID" value={account.legalId} />
                      <InfoRow
                        label="Doc Type"
                        value={account.legalDocName}
                      />
                      <InfoRow
                        label="First Name (EN)"
                        value={toProperCase(account.legalFirstNameEn)}
                      />
                      <InfoRow
                        label="Last Name (EN)"
                        value={toProperCase(account.legalLastNameEn)}
                      />
                      <InfoRow
                        label="First Name (KH)"
                        value={account.legalFirstNameKh}
                      />
                      <InfoRow
                        label="Last Name (KH)"
                        value={account.legalLastNameKh}
                      />
                      <InfoRow
                        label="Date of Birth"
                        value={account.legalDateOfBirth}
                      />
                      <InfoRow label="Gender" value={account.legalGender} />
                      <InfoRow
                        label="Marital Status"
                        value={account.maritalStatus}
                      />
                      <InfoRow
                        label="Nationality"
                        value={account.nationality}
                      />
                      <InfoRow
                        label="Phone Number"
                        value={account.phoneNumber}
                      />
                      <InfoRow
                        label="Issued Date"
                        value={account.legalIssuedDate}
                      />
                      <InfoRow
                        label="Expired Date"
                        value={account.legalExpiredDate}
                      />
                    </div>
                    {/* MRZ codes */}
                    {(account.legalMRZ1 || account.legalMRZ2 || account.legalMRZ3) && (
                      <div className="rounded-md bg-muted/50 border p-3 font-mono text-xs space-y-1">
                        <p className="text-muted-foreground font-semibold mb-2 non-mono text-xs">
                          MRZ
                        </p>
                        {account.legalMRZ1 && <p>{account.legalMRZ1}</p>}
                        {account.legalMRZ2 && <p>{account.legalMRZ2}</p>}
                        {account.legalMRZ3 && <p>{account.legalMRZ3}</p>}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Employment Information */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-green-600"
                      title="Employment Information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Company Name"
                        value={account.companyName}
                      />
                      <InfoRow label="Occupation" value={account.occupation} />
                    </div>
                  </div>

                  <Separator />

                  {/* Address Information */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-orange-600"
                      title="Address Information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Province"
                        value={account.customerProvince}
                      />
                      <InfoRow
                        label="District"
                        value={account.customerDistrict}
                      />
                      <InfoRow
                        label="Commune"
                        value={account.customerCommune}
                      />
                      <InfoRow
                        label="Village"
                        value={account.customerVillage}
                      />
                      <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground shrink-0">
                          Full Address:
                        </Label>
                        <span className="text-sm font-semibold text-right">
                          {account.legalAddress || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Place of Birth */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-yellow-600"
                      title="Place of Birth"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Province"
                        value={account.customerPobProvince}
                      />
                      <InfoRow
                        label="District"
                        value={account.customerPobDistrict}
                      />
                      <InfoRow
                        label="Commune"
                        value={account.customerPobCommune}
                      />
                      <InfoRow
                        label="Village"
                        value={account.customerPobVillage}
                      />
                      <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground shrink-0">
                          Full Place of Birth:
                        </Label>
                        <span className="text-sm font-semibold text-right">
                          {account.legalPlaceOfBirth || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Branch Information */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-indigo-600"
                      title="Branch Information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Branch Code"
                        value={account.branchCode}
                      />
                      <InfoRow
                        label="Branch Name (KH)"
                        value={account.branchNameKh}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* AML Information */}
                  <div className="space-y-4">
                    <SectionHeader color="bg-red-600" title="AML Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between border-b pb-2 gap-4">
                        <Label className="text-sm font-medium text-muted-foreground shrink-0">
                          AML Status:
                        </Label>
                        <AmlStatusBadge status={account.amlStatus} />
                      </div>
                      <InfoRow
                        label="Risk Level"
                        value={account.amlRiskLevel}
                      />
                      <InfoRow
                        label="Action By"
                        value={account.amlActionName}
                      />
                      <InfoRow
                        label="Action Role"
                        value={account.amlActionRole}
                      />
                      <InfoRow
                        label="Action Taken"
                        value={account.amlActionTaken}
                      />
                      <InfoRow
                        label="Total Rules Score"
                        value={String(account.amlTotalRulesScore ?? "0")}
                      />
                      <InfoRow
                        label="Transaction ID"
                        value={account.amlTrxnId}
                      />
                      {account.amlRemarks && (
                        <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                          <Label className="text-sm font-medium text-muted-foreground shrink-0">
                            Remarks:
                          </Label>
                          <span className="text-sm font-semibold text-right">
                            {account.amlRemarks}
                          </span>
                        </div>
                      )}
                      {account.amlRulesTriggered && (
                        <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                          <Label className="text-sm font-medium text-muted-foreground shrink-0">
                            Rules Triggered:
                          </Label>
                          <span className="text-sm font-semibold text-right">
                            {account.amlRulesTriggered}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* System Information */}
                  <div className="space-y-4">
                    <SectionHeader
                      color="bg-gray-600"
                      title="System Information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Submitted By"
                        value={account.submittedBy}
                      />
                      <InfoRow
                        label="Created At"
                        value={DateTimeFormat(account.createdAt)}
                      />
                    </div>

                    {/* Submitted By User details */}
                    {account.submittedByUser && (
                      <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Submitted By User
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InfoRow
                            label="Full Name"
                            value={account.submittedByUser.fullName}
                          />
                          <InfoRow
                            label="Email"
                            value={account.submittedByUser.email}
                          />
                          <InfoRow
                            label="Role"
                            value={account.submittedByUser.userRole}
                          />
                          <InfoRow
                            label="Position"
                            value={account.submittedByUser.position}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No account data available
                  </p>
                </div>
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
