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

interface SuccessAccountViewModalProps {
  account?: SuccessAccountOnlineModel;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessAccountViewModal({
  account,
  isOpen,
  onClose,
}: SuccessAccountViewModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
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
                {/* Account Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Account Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        CIF:
                      </Label>
                      <span className="text-sm font-semibold">
                        {account.cif || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        KHR Account:
                      </Label>
                      <span className="text-sm font-semibold">
                        {account.khrAccount || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        USD Account:
                      </Label>
                      <span className="text-sm font-semibold">
                        {account.usdAccount || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Mnemonic:
                      </Label>
                      <span className="text-sm font-semibold">
                        {account.mnemonic || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Holder Name:
                      </Label>
                      <span className="text-sm font-semibold">
                        {toProperCase(account.legalHolderName)}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Legal ID:
                      </Label>
                      <span className="text-sm font-semibold">
                        {account.legalId || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        First Name (EN):
                      </Label>
                      <span className="text-sm">
                        {toProperCase(account.legalFirstNameEn)}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Name (EN):
                      </Label>
                      <span className="text-sm">
                        {toProperCase(account.legalLastNameEn)}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        First Name (KH):
                      </Label>
                      <span className="text-sm">
                        {account.legalFirstNameKh || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Name (KH):
                      </Label>
                      <span className="text-sm">
                        {account.legalLastNameKh || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Date of Birth:
                      </Label>
                      <span className="text-sm">
                        {account.legalDateOfBirth || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Gender:
                      </Label>
                      <span className="text-sm">
                        {account.legalGender || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Marital Status:
                      </Label>
                      <span className="text-sm">
                        {account.maritalStatus || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Nationality:
                      </Label>
                      <span className="text-sm">
                        {account.nationality || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Phone Number:
                      </Label>
                      <span className="text-sm">
                        {account.phoneNumber || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Place of Birth:
                      </Label>
                      <span className="text-sm">
                        {account.legalPlaceOfBirth || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employment Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Employment Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Company Name:
                      </Label>
                      <span className="text-sm">
                        {account.companyName || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Occupation:
                      </Label>
                      <span className="text-sm">
                        {account.occupation || "N/A"}
                      </span>
                    </div>

                    {/* <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Average Income:
                      </Label>
                      <span className="text-sm">
                        {account.averageIncome || "N/A"}
                      </span>
                    </div> */}
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Address Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Province:
                      </Label>
                      <span className="text-sm">
                        {account.customerProvince || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        District:
                      </Label>
                      <span className="text-sm">
                        {account.customerDistrict || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Commune:
                      </Label>
                      <span className="text-sm">
                        {account.customerCommune || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Village:
                      </Label>
                      <span className="text-sm">
                        {account.customerVillage || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2 md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Full Address:
                      </Label>
                      <span className="text-sm">
                        {account.legalAddress || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Branch Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Branch Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Branch Code:
                      </Label>
                      <span className="text-sm">
                        {account.branchCode || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Branch Name (KH):
                      </Label>
                      <span className="text-sm">
                        {account.branchNameKh || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AML Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">AML Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        AML Status:
                      </Label>
                      <AmlStatusBadge status={account.amlStatus} />
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Risk Level:
                      </Label>
                      <span className="text-sm">
                        {account.amlRiskLevel || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Action By:
                      </Label>
                      <span className="text-sm">
                        {account.amlActionName || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Action Role:
                      </Label>
                      <span className="text-sm">
                        {account.amlActionRole || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Action Taken:
                      </Label>
                      <span className="text-sm">
                        {account.amlActionTaken || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Total Rules Score:
                      </Label>
                      <span className="text-sm">
                        {account.amlTotalRulesScore || "0"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Transaction ID:
                      </Label>
                      <span className="text-sm">
                        {account.amlTrxnId || "N/A"}
                      </span>
                    </div>

                    {account.amlRemarks && (
                      <div className="flex justify-between border-b pb-2 md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Remarks:
                        </Label>
                        <span className="text-sm max-w-md text-right">
                          {account.amlRemarks}
                        </span>
                      </div>
                    )}

                    {account.amlRulesTriggered && (
                      <div className="flex justify-between border-b pb-2 md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Rules Triggered:
                        </Label>
                        <span className="text-sm max-w-md text-right">
                          {account.amlRulesTriggered}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* System Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gray-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      System Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created At:
                      </Label>
                      <span className="text-sm">
                        {DateTimeFormat(account.createdAt) || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Updated At:
                      </Label>
                      <span className="text-sm">
                        {DateTimeFormat(account.updatedAt) || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created By:
                      </Label>
                      <span className="text-sm">
                        {account.createdBy || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Updated By:
                      </Label>
                      <span className="text-sm">
                        {account.updatedBy || "N/A"}
                      </span>
                    </div>
                  </div>
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
