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
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    );
  };

  // Get nationality from amlResultData.customerInfo if not available at top level
  const getNationality = () => {
    return account.nationality || account.amlResultData?.customerInfo?.nationality;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
        {/* HEADER */}
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{account.legalId}</h2>
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
              <Badge
                className={
                  account.amlStatus === "APPROVE" ? "bg-green-100 text-green-800" :
                  account.amlStatus === "REJECT" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }
              >
                {account.amlStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* BODY - TABS */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0 rounded-none border-b bg-white px-6 gap-0">
              <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="aml" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                <Shield className="w-4 h-4 mr-1" />
                AML Screening
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-6 space-y-6 bg-gray-50">
                  {/* IMAGES FIRST */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Identity Documents</h3>
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
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Request Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Request Status" value={account.status} />
                      <Field label="AML Status" value={account.amlStatus} />
                      <Field label="Submitted Date" value={new Date(account.createdAt).toLocaleString()} />
                      {account.updatedAt && <Field label="Updated Date" value={new Date(account.updatedAt).toLocaleString()} />}
                    </div>
                  </div>

                  {/* PERSONAL INFO */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Name (English)" value={`${account.legalFirstNameEn || ""} ${account.legalLastNameEn || ""}`.trim()} />
                      <Field label="Name (Khmer)" value={`${account.legalFirstNameKh || ""} ${account.legalLastNameKh || ""}`.trim()} />
                      <Field label="Date of Birth" value={account.legalDateOfBirth} />
                      <Field label="Gender" value={account.legalGender} />
                      <Field label="Nationality" value={getNationality()} />
                      <Field label="Marital Status" value={account.maritalStatus} />
                      <Field label="Phone Number" value={account.phoneNumber} />
                      <Field label="Email" value={account.email} />
                    </div>
                  </div>

                  {/* LEGAL DOCUMENT */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Legal Document</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Document Type" value={account.legalDocName} />
                      <Field label="Issued Date" value={account.legalIssuedDate} />
                      <Field label="Expiration Date" value={account.legalExpiredDate} />
                      <Field label="Current Address" value={account.legalAddress} />
                      <Field label="Place of Birth" value={account.legalPlaceOfBirth} />
                    </div>
                  </div>

                  {/* EMPLOYMENT & BANKING */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Employment & Banking</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Company Name" value={account.companyName || "-"} />
                      <Field label="Occupation" value={account.occupation} />
                      <Field label="Industry" value={account.industry || "-"} />
                      <Field label="Sector" value={account.sector || "-"} />
                      <Field label="Branch Code" value={account.branchCode} />
                      <Field label="Customer Role" value={account.customerRole} />
                      <Field label="Product Account" value={account.productAccount || "-"} />
                      <Field label="Account Category" value={account.categoryAccount || "-"} />
                    </div>
                  </div>

                  {/* REMARKS */}
                  {account.remark && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                      <p className="text-xs font-bold text-amber-900 mb-1">Admin Remarks</p>
                      <p className="text-sm text-amber-900">{account.remark}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AML TAB */}
            <TabsContent value="aml" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-6 space-y-6 bg-gray-50">
                  {account.amlResultData ? (
                    <>
                      {/* AML SCREENING RESULT */}
                      <div className={`p-5 rounded-lg border-2 ${
                        account.amlResultData.status === "APPROVE"
                          ? "bg-green-50 border-green-300"
                          : account.amlResultData.status === "REJECT"
                          ? "bg-red-50 border-red-300"
                          : "bg-yellow-50 border-yellow-300"
                      }`}>
                        <h3 className="text-sm font-bold mb-4">AML Screening Result</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                            <Badge className={
                              account.amlResultData.status === "APPROVE" ? "bg-green-600" :
                              account.amlResultData.status === "REJECT" ? "bg-red-600" :
                              "bg-yellow-600"
                            }>
                              {account.amlResultData.status}
                            </Badge>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Risk Level</p>
                            <p className="text-sm font-semibold">{account.amlResultData.riskLevel}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Service Name</p>
                            <p className="text-sm font-semibold text-gray-900">{account.amlResultData.serviceName}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Rules Score</p>
                            <p className="text-sm font-semibold text-gray-900">{account.amlResultData.totalRulesScore}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg col-span-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Transaction ID</p>
                            <p className="text-sm font-semibold text-gray-900">{account.amlResultData.trxnID}</p>
                          </div>
                        </div>
                      </div>

                      {/* SCREENING DETAILS */}
                      {account.amlResultData.screeningResult && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Screening Details</h3>
                          <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 font-mono break-words">{account.amlResultData.screeningResult}</p>
                          </div>
                        </div>
                      )}

                      {/* VERIFIED CUSTOMER DATA */}
                      {account.amlResultData.customerInfo && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Verified Customer Data</h3>
                          <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Legal ID</p>
                              <p className="text-sm font-semibold text-gray-900">{account.amlResultData.customerInfo.legalId}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                              <p className="text-sm font-semibold text-gray-900">{`${account.amlResultData.customerInfo.givenName || ""} ${account.amlResultData.customerInfo.familyName || ""}`.trim()}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Date of Birth</p>
                              <p className="text-sm font-semibold text-gray-900">{account.amlResultData.customerInfo.dateOfBirth}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Gender</p>
                              <p className="text-sm font-semibold text-gray-900">{account.amlResultData.customerInfo.gender}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Nationality</p>
                              <p className="text-sm font-semibold text-gray-900">{account.amlResultData.customerInfo.nationality}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                              <p className="text-sm font-semibold text-gray-900">{account.amlResultData.customerInfo.phoneNumber}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg col-span-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                              <p className="text-sm font-semibold text-gray-900">{account.amlResultData.customerInfo.legalAddress}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AUDIT TRAIL */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Audit Trail</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Created At" value={account.amlResultData.createdAt} />
                          <Field label="Updated At" value={account.amlResultData.updatedAt} />
                          {account.amlResultData.approvedBy && (
                            <Field label="Approved By" value={account.amlResultData.approvedBy.fullName} />
                          )}
                          {account.amlResultData.rejectedBy && (
                            <Field label="Rejected By" value={account.amlResultData.rejectedBy.fullName} />
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No AML data available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER */}
        {!isReadOnly && (account.status === "PENDING") && (
          <div className="flex-shrink-0 border-t bg-white px-6 py-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-gray-50"
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
