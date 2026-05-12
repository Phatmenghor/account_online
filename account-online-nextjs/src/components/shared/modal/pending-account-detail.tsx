"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingAccountAdminReviewDto } from "@/models/open-account-admin/pending-account.response";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageDisplayCard from "@/components/shared/card/image-display-card";

interface PendingAccountDetailModalProps {
  account?: PendingAccountAdminReviewDto;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (account: PendingAccountAdminReviewDto) => void;
  onReject?: (account: PendingAccountAdminReviewDto) => void;
  isReadOnly?: boolean;
}

export default function PendingAccountDetailModal({
  account,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isReadOnly = false,
}: PendingAccountDetailModalProps) {
  if (!account) return null;

  const Field = ({ label, value }: { label: string; value?: any }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between items-start py-2 gap-4">
        <span className="text-xs font-medium text-gray-600 min-w-fit">{label}</span>
        <span className="text-sm text-gray-900 text-right flex-1">{value}</span>
      </div>
    );
  };

  // Get nationality from amlResultData.customerInfo if not available at top level
  const getNationality = () => {
    return account.nationality || account.amlResultData?.customerInfo?.nationality;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0">
        {/* HEADER */}
        <div className="flex-shrink-0 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{account.legalId}</h2>
              <p className="text-xs text-gray-500 mt-1">Request ID: {account.requestId}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  account.status === "PENDING" ? "secondary" :
                  account.status === "APPROVED" ? "default" :
                  "destructive"
                }
              >
                {account.status}
              </Badge>
              <Badge variant="outline">{account.amlStatus}</Badge>
            </div>
          </div>
        </div>

        {/* BODY - TABS */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0 rounded-none border-b bg-white px-6">
              <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="aml" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                <Shield className="w-4 h-4 mr-1" />
                AML
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-6 space-y-6">
                  {/* IMAGES FIRST */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageDisplayCard
                        title="National ID Document"
                        imageName={account.nidImageName}
                        imageType="nid"
                        legalId={account.legalId}
                      />
                      <ImageDisplayCard
                        title="Selfie Photo"
                        imageName={account.selfieImageName}
                        imageType="selfie"
                        legalId={account.legalId}
                      />
                    </div>
                  </div>

                  {/* REQUEST INFO */}
                  <div className="space-y-1">
                    <Field label="Request Status" value={account.status} />
                    <Field label="AML Status" value={account.amlStatus} />
                    <Field label="Submitted Date" value={new Date(account.createdAt).toLocaleString()} />
                    {account.updatedAt && <Field label="Updated Date" value={new Date(account.updatedAt).toLocaleString()} />}
                  </div>

                  {/* PERSONAL INFO */}
                  <div className="space-y-1">
                    <Field label="Name (EN)" value={`${account.legalFirstNameEn || ""} ${account.legalLastNameEn || ""}`.trim()} />
                    <Field label="Name (KH)" value={`${account.legalFirstNameKh || ""} ${account.legalLastNameKh || ""}`.trim()} />
                    <Field label="Date of Birth" value={account.legalDateOfBirth} />
                    <Field label="Gender" value={account.legalGender} />
                    <Field label="Nationality" value={getNationality()} />
                    <Field label="Marital Status" value={account.maritalStatus} />
                    <Field label="Phone" value={account.phoneNumber} />
                    <Field label="Email" value={account.email} />
                  </div>

                  {/* LEGAL DOCUMENT */}
                  <div className="space-y-1">
                    <Field label="Document Type" value={account.legalDocName} />
                    <Field label="Issued Date" value={account.legalIssuedDate} />
                    <Field label="Expiration Date" value={account.legalExpiredDate} />
                    {account.legalMRZ1 && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <p className="font-mono">{account.legalMRZ1}</p>
                        <p className="font-mono">{account.legalMRZ2}</p>
                        <p className="font-mono">{account.legalMRZ3}</p>
                      </div>
                    )}
                  </div>

                  {/* ADDRESS */}
                  <div className="space-y-1">
                    <Field label="Current Address" value={account.legalAddress} />
                    <Field label="Place of Birth" value={account.legalPlaceOfBirth} />
                  </div>

                  {/* EMPLOYMENT & BANKING */}
                  <div className="space-y-1">
                    <Field label="Company Name" value={account.companyName} />
                    <Field label="Occupation" value={account.occupation} />
                    <Field label="Industry" value={account.industry} />
                    <Field label="Sector" value={account.sector} />
                    <Field label="Average Income" value={account.averageIncome} />
                    <Field label="Branch Code" value={account.branchCode} />
                    <Field label="Product Account" value={account.productAccount} />
                    <Field label="Account Category" value={account.categoryAccount} />
                    <Field label="Customer Role" value={account.customerRole} />
                    <Field label="Loan Officer" value={account.loanOfficer} />
                    <Field label="Released By" value={account.releasedBy} />
                  </div>

                  {/* REMARKS */}
                  {account.remark && (
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Admin Remarks</p>
                      <p className="text-sm text-amber-900">{account.remark}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AML TAB */}
            <TabsContent value="aml" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-6 space-y-4">
                  {account.amlResultData ? (
                    <>
                      {/* AML SCREENING RESULT */}
                      <div className={`p-4 rounded-lg border-2 space-y-1 ${
                        account.amlResultData.status === "APPROVE"
                          ? "bg-green-50 border-green-300"
                          : account.amlResultData.status === "REJECT"
                          ? "bg-red-50 border-red-300"
                          : "bg-yellow-50 border-yellow-300"
                      }`}>
                        <Field label="AML Status" value={account.amlResultData.status} />
                        <Field label="Risk Level" value={account.amlResultData.riskLevel} />
                        <Field label="Service Name" value={account.amlResultData.serviceName} />
                        <Field label="Rules Score" value={account.amlResultData.totalRulesScore} />
                        <Field label="Transaction ID" value={account.amlResultData.trxnID} />
                        {account.amlResultData.rulesTriggered && (
                          <Field label="Rules Triggered" value={account.amlResultData.rulesTriggered} />
                        )}
                        {account.amlResultData.actionTaken && (
                          <Field label="Action Taken" value={account.amlResultData.actionTaken} />
                        )}
                      </div>

                      {/* SCREENING DETAILS */}
                      {account.amlResultData.screeningResult && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Screening Result</p>
                          <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40 text-gray-700">
                            {account.amlResultData.screeningResult}
                          </div>
                        </div>
                      )}

                      {/* VERIFIED CUSTOMER DATA */}
                      {account.amlResultData.customerInfo && (
                        <div className="space-y-1 bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Verified Customer Data (from AML)</p>
                          <Field label="Legal ID" value={account.amlResultData.customerInfo.legalId} />
                          <Field label="Name (EN)" value={`${account.amlResultData.customerInfo.givenName || ""} ${account.amlResultData.customerInfo.familyName || ""}`.trim()} />
                          <Field label="Date of Birth" value={account.amlResultData.customerInfo.dateOfBirth} />
                          <Field label="Gender" value={account.amlResultData.customerInfo.gender} />
                          <Field label="Nationality" value={account.amlResultData.customerInfo.nationality} />
                          <Field label="Phone" value={account.amlResultData.customerInfo.phoneNumber} />
                          <Field label="Address" value={account.amlResultData.customerInfo.legalAddress} />
                        </div>
                      )}

                      {/* AUDIT TRAIL */}
                      <div className="space-y-1 border-t pt-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Audit Trail</p>
                        <Field label="Created At" value={account.amlResultData.createdAt} />
                        <Field label="Updated At" value={account.amlResultData.updatedAt} />
                        {account.amlResultData.approvedBy && (
                          <Field label="Approved By" value={account.amlResultData.approvedBy.fullName} />
                        )}
                        {account.amlResultData.rejectedBy && (
                          <Field label="Rejected By" value={account.amlResultData.rejectedBy.fullName} />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No AML data available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER */}
        {!isReadOnly && (account.status === "PENDING") && (
          <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => onReject?.(account)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onApprove?.(account)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
