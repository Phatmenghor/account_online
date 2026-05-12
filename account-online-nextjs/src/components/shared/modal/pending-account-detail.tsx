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
import { toProperCase } from "@/utils/common/common";

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
      <div className="py-3 border-b border-gray-100 last:border-b-0">
        <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
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
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{account.legalId}</h2>
              <p className="text-xs text-blue-100 mt-1">Request ID: {account.requestId}</p>
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
            </div>
          </div>
        </div>

        {/* BODY - TABS */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0 rounded-none border-b bg-gray-50 px-6 gap-0">
              <TabsTrigger value="overview" className="text-xs font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-3 transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger value="aml" className="text-xs font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-3 transition-all">
                <Shield className="w-4 h-4 mr-1" />
                AML Screening
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-6 space-y-6 bg-white">
                  {/* IMAGES FIRST */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
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

                  {/* REQUEST & PERSONAL INFO */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Request & Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Request Status" value={account.status} />
                      <Field label="AML Status" value={account.amlStatus} />
                      <Field label="Submitted Date" value={new Date(account.createdAt).toLocaleString()} />
                      <Field label="Name (English)" value={toProperCase(`${account.legalLastNameEn || ""} ${account.legalFirstNameEn || ""}`.trim())} />
                      <Field label="Name (Khmer)" value={`${account.legalLastNameKh || ""} ${account.legalFirstNameKh || ""}`.trim()} />
                      <Field label="Date of Birth" value={account.legalDateOfBirth} />
                      <Field label="Gender" value={account.legalGender} />
                      <Field label="Nationality" value={getNationality()} />
                      <Field label="Marital Status" value={account.maritalStatus} />
                      <Field label="Phone Number" value={account.phoneNumber} />
                      <Field label="Email" value={account.email} />
                    </div>
                  </div>

                  {/* LEGAL DOCUMENT & EMPLOYMENT BANKING */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Legal Document & Employment Banking</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Document Type" value={account.legalDocName} />
                      <Field label="Issued Date" value={account.legalIssuedDate} />
                      <Field label="Expiration Date" value={account.legalExpiredDate} />
                      <Field label="MRZ Line 1" value={account.legalMRZ1} />
                      <Field label="MRZ Line 2" value={account.legalMRZ2} />
                      <Field label="MRZ Line 3" value={account.legalMRZ3} />
                      <Field label="Current Address" value={account.legalAddress} />
                      <Field label="Place of Birth" value={account.legalPlaceOfBirth} />
                      <Field label="Company Name" value={account.companyName} />
                      <Field label="Occupation" value={account.occupation} />
                      <Field label="Industry" value={account.industry} />
                      <Field label="Sector" value={account.sector} />
                      <Field label="Branch Code" value={account.branchCode} />
                      <Field label="Customer Role" value={account.customerRole} />
                      <Field label="Product Account" value={account.productAccount} />
                      <Field label="Account Category" value={account.categoryAccount} />
                      <Field label="Loan Officer" value={account.loanOfficer} />
                      <Field label="Released By" value={account.releasedBy} />
                    </div>
                  </div>

                  {/* CUSTOMER ADDRESS DETAILS */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Customer Address Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Province" value={account.customerProvince} />
                      <Field label="District" value={account.customerDistrict} />
                      <Field label="Commune" value={account.customerCommune} />
                      <Field label="Village" value={account.customerVillage} />
                      <Field label="Place of Birth - Province" value={account.customerPobProvince} />
                      <Field label="Place of Birth - District" value={account.customerPobDistrict} />
                      <Field label="Place of Birth - Commune" value={account.customerPobCommune} />
                      <Field label="Place of Birth - Village" value={account.customerPobVillage} />
                    </div>
                  </div>

                  {/* ACTION DETAILS - shown when viewing history */}
                  {account.actionUsername && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Action Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Action By" value={account.actionUsername} />
                        <Field label="Action Date" value={account.createdAt ? new Date(account.createdAt).toLocaleString() : "---"} />
                        {account.remark && (
                          <div className="col-span-2">
                            <div className="py-3 border-b border-blue-100 last:border-b-0">
                              <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Remark</p>
                              <p className="text-sm text-gray-900">{account.remark}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* REMARKS - Legacy fallback */}
                  {!account.actionUsername && account.remark && (
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
                <div className="p-6 space-y-6 bg-white">
                  {account.amlResultData ? (
                    <>
                      {/* AML SCREENING RESULT */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">AML Screening Result</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Status</p>
                            <Badge className={
                              account.amlResultData.status === "APPROVE" ? "bg-green-600" :
                              account.amlResultData.status === "REJECT" ? "bg-red-600" :
                              "bg-yellow-600"
                            }>
                              {account.amlResultData.status}
                            </Badge>
                          </div>
                          <div className="py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Risk Level</p>
                            <p className="text-sm text-gray-900">{account.amlResultData.riskLevel}</p>
                          </div>
                          <div className="py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Service Name</p>
                            <p className="text-sm text-gray-900">{account.amlResultData.serviceName}</p>
                          </div>
                          <div className="py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Rules Score</p>
                            <p className="text-sm text-gray-900">{account.amlResultData.totalRulesScore}</p>
                          </div>
                          <div className="col-span-2 py-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Transaction ID</p>
                            <p className="text-sm text-gray-900">{account.amlResultData.trxnID}</p>
                          </div>
                        </div>
                      </div>

                      {/* SCREENING DETAILS */}
                      {account.amlResultData.screeningResult && (
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Screening Details</h3>
                          <p className="text-sm text-gray-700 font-mono break-words">{account.amlResultData.screeningResult}</p>
                        </div>
                      )}

                      {/* VERIFIED CUSTOMER DATA */}
                      {account.amlResultData.customerInfo && (
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Verified Customer Data</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Legal ID" value={account.amlResultData.customerInfo.legalId} />
                            <Field label="Name" value={`${account.amlResultData.customerInfo.givenName || ""} ${account.amlResultData.customerInfo.familyName || ""}`.trim()} />
                            <Field label="Date of Birth" value={account.amlResultData.customerInfo.dateOfBirth} />
                            <Field label="Gender" value={account.amlResultData.customerInfo.gender} />
                            <Field label="Nationality" value={account.amlResultData.customerInfo.nationality} />
                            <Field label="Phone" value={account.amlResultData.customerInfo.phoneNumber} />
                            <div className="col-span-2">
                              <Field label="Address" value={account.amlResultData.customerInfo.legalAddress} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AUDIT TRAIL */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
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
