"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingAccountAdminReviewDto } from "@/models/open-account-admin/pending-account.response";
import { User, FileText, Shield, Briefcase, AlertCircle, Image as ImageIcon } from "lucide-react";
import ImageDisplayCard from "@/components/shared/card/image-display-card";

interface PendingAccountDetailModalProps {
  account?: PendingAccountAdminReviewDto;
  isOpen: boolean;
  onClose: () => void;
  isReadOnly?: boolean;
}

export default function PendingAccountDetailModal({
  account,
  isOpen,
  onClose,
}: PendingAccountDetailModalProps) {
  if (!account) return null;

  const Field = ({ label, value }: { label: string; value?: any }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b-2 border-blue-200">{title}</h3>
      {children}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>{account.legalId}</span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 mt-2">
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
            <span className="text-xs text-gray-500">
              Submitted: {new Date(account.createdAt).toLocaleDateString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="w-full flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
              <TabsTrigger value="overview" className="text-xs">
                <AlertCircle className="w-4 h-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs">
                <User className="w-4 h-4 mr-1" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="address" className="text-xs">
                <FileText className="w-4 h-4 mr-1" />
                Address
              </TabsTrigger>
              <TabsTrigger value="aml" className="text-xs">
                <Shield className="w-4 h-4 mr-1" />
                AML
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs">
                <ImageIcon className="w-4 h-4 mr-1" />
                Images
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {/* Request Info */}
                  <Section title="Request Information">
                    <Field label="Request ID" value={account.requestId} />
                    <Field label="Legal ID" value={account.legalId} />
                    <Field label="Status" value={account.status} />
                    <Field label="AML Status" value={account.amlStatus} />
                    <Field label="Submitted" value={new Date(account.createdAt).toLocaleString()} />
                    {account.updatedAt && <Field label="Updated" value={new Date(account.updatedAt).toLocaleString()} />}
                  </Section>

                  {/* Basic Customer Info */}
                  <Section title="Customer Information">
                    <Field label="Full Name" value={`${account.legalFirstNameEn || ""} ${account.legalLastNameEn || ""}`.trim()} />
                    <Field label="Full Name (Khmer)" value={`${account.legalFirstNameKh || ""} ${account.legalLastNameKh || ""}`.trim()} />
                    <Field label="Date of Birth" value={account.legalDateOfBirth} />
                    <Field label="Gender" value={account.legalGender} />
                    <Field label="Nationality" value={account.nationality} />
                    <Field label="Marital Status" value={account.maritalStatus} />
                    <Field label="Phone Number" value={account.phoneNumber} />
                    <Field label="Email" value={account.email} />
                  </Section>

                  {/* AML Summary */}
                  {account.amlResultData && (
                    <div className={`p-3 rounded-lg border-2 ${
                      account.amlResultData.status === "APPROVE"
                        ? "bg-green-50 border-green-300"
                        : account.amlResultData.status === "REJECT"
                        ? "bg-red-50 border-red-300"
                        : "bg-yellow-50 border-yellow-300"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4" />
                        <span className="font-semibold text-sm">AML Result: {account.amlResultData.status}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p>Risk Level: <span className="font-semibold">{account.amlResultData.riskLevel}</span></p>
                        <p>Rules Score: <span className="font-semibold">{account.amlResultData.totalRulesScore}</span></p>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {account.remark && (
                    <Section title="Admin Remarks">
                      <div className="bg-amber-50 p-3 rounded text-sm text-amber-900 border border-amber-200">
                        {account.remark}
                      </div>
                    </Section>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* PERSONAL TAB */}
            <TabsContent value="personal" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <Section title="Personal Information">
                    <Field label="Title" value={account.title} />
                    <Field label="Given Name (EN)" value={account.legalFirstNameEn} />
                    <Field label="Family Name (EN)" value={account.legalLastNameEn} />
                    <Field label="Given Name (KH)" value={account.legalFirstNameKh} />
                    <Field label="Family Name (KH)" value={account.legalLastNameKh} />
                    <Field label="Gender" value={account.legalGender} />
                    <Field label="Date of Birth" value={account.legalDateOfBirth} />
                    <Field label="Place of Birth" value={account.legalPlaceOfBirth} />
                  </Section>

                  <Section title="Contact Information">
                    <Field label="Phone Number" value={account.phoneNumber} />
                    <Field label="Email" value={account.email} />
                    <Field label="Nationality" value={account.nationality} />
                  </Section>

                  <Section title="Demographic Information">
                    <Field label="Marital Status" value={account.maritalStatus} />
                    <Field label="Occupation" value={account.occupation} />
                    <Field label="Company Name" value={account.companyName} />
                    <Field label="Industry" value={account.industry} />
                    <Field label="Sector" value={account.sector} />
                    <Field label="Average Income" value={account.averageIncome} />
                  </Section>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ADDRESS TAB */}
            <TabsContent value="address" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <Section title="Current Address">
                    <Field label="Address" value={account.legalAddress} />
                    <Field label="Province" value={account.customerProvince} />
                    <Field label="District" value={account.customerDistrict} />
                    <Field label="Commune" value={account.customerCommune} />
                    <Field label="Village" value={account.customerVillage} />
                  </Section>

                  <Section title="Place of Birth">
                    <Field label="Province" value={account.customerPobProvince} />
                    <Field label="District" value={account.customerPobDistrict} />
                    <Field label="Commune" value={account.customerPobCommune} />
                    <Field label="Village" value={account.customerPobVillage} />
                  </Section>

                  <Section title="Banking Information">
                    <Field label="Branch Code" value={account.branchCode} />
                    <Field label="Product Account" value={account.productAccount} />
                    <Field label="Category Account" value={account.categoryAccount} />
                    <Field label="Customer Role" value={account.customerRole} />
                    <Field label="Loan Officer" value={account.loanOfficer} />
                    <Field label="Released By" value={account.releasedBy} />
                  </Section>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AML TAB */}
            <TabsContent value="aml" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {account.amlResultData ? (
                    <>
                      {/* AML Status */}
                      <Section title="AML Screening Result">
                        <div className={`p-3 rounded-lg border-2 ${
                          account.amlResultData.status === "APPROVE"
                            ? "bg-green-50 border-green-300"
                            : account.amlResultData.status === "REJECT"
                            ? "bg-red-50 border-red-300"
                            : "bg-yellow-50 border-yellow-300"
                        }`}>
                          <Field label="Status" value={account.amlResultData.status} />
                          <Field label="Risk Level" value={account.amlResultData.riskLevel} />
                          <Field label="Service" value={account.amlResultData.serviceName} />
                          <Field label="Rules Score" value={account.amlResultData.totalRulesScore} />
                          <Field label="Transaction ID" value={account.amlResultData.trxnID} />
                          {account.amlResultData.rulesTriggered && (
                            <Field label="Rules Triggered" value={account.amlResultData.rulesTriggered} />
                          )}
                          {account.amlResultData.actionTaken && (
                            <Field label="Action Taken" value={account.amlResultData.actionTaken} />
                          )}
                        </div>
                      </Section>

                      {/* Screening Result */}
                      {account.amlResultData.screeningResult && (
                        <Section title="Screening Details">
                          <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                            {account.amlResultData.screeningResult}
                          </div>
                        </Section>
                      )}

                      {/* Customer Info from AML */}
                      {account.amlResultData.customerInfo && (
                        <Section title="Verified Customer Data (from AML)">
                          <Field label="Legal ID" value={account.amlResultData.customerInfo.legalId} />
                          <Field label="Given Name" value={account.amlResultData.customerInfo.givenName} />
                          <Field label="Family Name" value={account.amlResultData.customerInfo.familyName} />
                          <Field label="Date of Birth" value={account.amlResultData.customerInfo.dateOfBirth} />
                          <Field label="Gender" value={account.amlResultData.customerInfo.gender} />
                          <Field label="Nationality" value={account.amlResultData.customerInfo.nationality} />
                          <Field label="Phone Number" value={account.amlResultData.customerInfo.phoneNumber} />
                          <Field label="Address" value={account.amlResultData.customerInfo.legalAddress} />
                        </Section>
                      )}

                      {/* Audit Trail */}
                      <Section title="Audit Trail">
                        <Field label="Created At" value={account.amlResultData.createdAt} />
                        <Field label="Updated At" value={account.amlResultData.updatedAt} />
                        {account.amlResultData.approvedBy && (
                          <Field label="Approved By" value={account.amlResultData.approvedBy.fullName} />
                        )}
                        {account.amlResultData.rejectedBy && (
                          <Field label="Rejected By" value={account.amlResultData.rejectedBy.fullName} />
                        )}
                      </Section>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No AML data available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* IMAGES TAB */}
            <TabsContent value="images" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
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
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
