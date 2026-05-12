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
import { useState, useEffect } from "react";
import { User, FileText, Image as ImageIcon, AlertCircle, DollarSign } from "lucide-react";
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
  isReadOnly = false,
}: PendingAccountDetailModalProps) {
  if (!account) return null;

  const displayField = (label: string, value: any) => {
    if (!value) return null;
    return (
      <div key={label}>
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <User className="h-5 w-5" />
            Account Opening Request - {account.legalId}
          </DialogTitle>
          <DialogDescription className="flex gap-4">
            <Badge variant={account.status === "PENDING" ? "secondary" : account.status === "APPROVED" ? "default" : "destructive"}>
              {account.status}
            </Badge>
            <Badge variant="outline">{account.amlStatus}</Badge>
            <span>Submitted: {account.createdAt}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">
                <User className="w-4 h-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="address">
                <FileText className="w-4 h-4 mr-2" />
                Address
              </TabsTrigger>
              <TabsTrigger value="legal">
                <AlertCircle className="w-4 h-4 mr-2" />
                Legal
              </TabsTrigger>
              <TabsTrigger value="business">
                <DollarSign className="w-4 h-4 mr-2" />
                Business
              </TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </TabsTrigger>
            </TabsList>

            {/* PERSONAL TAB */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {displayField("Title", account.title)}
                    {displayField("Given Name", account.legalFirstNameEn)}
                    {displayField("Family Name", account.legalLastNameEn)}
                    {displayField("First Name (Khmer)", account.legalFirstNameKh)}
                    {displayField("Last Name (Khmer)", account.legalLastNameKh)}
                    {displayField("Gender", account.legalGender)}
                    {displayField("Date of Birth", account.legalDateOfBirth)}
                    {displayField("Nationality", account.nationality)}
                    {displayField("Marital Status", account.maritalStatus)}
                    {displayField("Phone Number", account.phoneNumber)}
                    {displayField("Email", account.email)}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ADDRESS TAB */}
            <TabsContent value="address" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Current Address</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {displayField("Province", account.customerProvince)}
                      {displayField("District", account.customerDistrict)}
                      {displayField("Commune", account.customerCommune)}
                      {displayField("Village", account.customerVillage)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Place of Birth</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {displayField("Province", account.customerPobProvince)}
                      {displayField("District", account.customerPobDistrict)}
                      {displayField("Commune", account.customerPobCommune)}
                      {displayField("Village", account.customerPobVillage)}
                      {displayField("Place of Birth", account.legalPlaceOfBirth)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Legal Address</h4>
                    <p className="text-sm text-foreground">
                      {account.legalAddress || "---"}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* LEGAL TAB */}
            <TabsContent value="legal" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {displayField("Document Type", account.legalDocName)}
                    {displayField("Holder Name", account.legalHolderName)}
                    {displayField("Issue Date", account.legalIssuedDate)}
                    {displayField("Expiration Date", account.legalExpiredDate)}
                  </div>

                  {account.legalMRZ1 && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h4 className="font-semibold text-sm mb-2">Machine Readable Zone (MRZ)</h4>
                      <div className="font-mono text-xs space-y-1">
                        <p>{account.legalMRZ1}</p>
                        <p>{account.legalMRZ2}</p>
                        <p>{account.legalMRZ3}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* BUSINESS TAB */}
            <TabsContent value="business" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Employment Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {displayField("Customer Type", account.customerType)}
                      {displayField("Company Name", account.companyName)}
                      {displayField("Occupation", account.occupation)}
                      {displayField("Industry", account.industry)}
                      {displayField("Sector", account.sector)}
                      {displayField("Average Income", account.averageIncome)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Banking Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {displayField("Branch Code", account.branchCode)}
                      {displayField("Product Account", account.productAccount)}
                      {displayField("Category Account", account.categoryAccount)}
                      {displayField("Customer Role", account.customerRole)}
                      {displayField("Loan Officer", account.loanOfficer)}
                      {displayField("Released By", account.releasedBy)}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* IMAGES TAB */}
            <TabsContent value="images" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
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
              </ScrollArea>
            </TabsContent>
          </Tabs>

        {/* FOOTER SECTION */}
        <div className="mt-6 pt-4 border-t space-y-3">
          {/* AML Status */}
          {account.amlResultData && typeof account.amlResultData === "object" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-2">AML Status:</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Risk Level: <span className="font-semibold">{(account.amlResultData as any).riskLevel || "---"}</span></p>
                <p>• Service: {(account.amlResultData as any).serviceName || "---"}</p>
                <p>• Rules Score: {(account.amlResultData as any).totalRulesScore || 0}</p>
              </div>
            </div>
          )}

          {/* Remarks */}
          {account.remark && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm font-medium text-amber-900 mb-1">Admin Remarks:</p>
              <p className="text-sm text-amber-800">{account.remark}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs font-medium text-gray-600 mb-2">ADDITIONAL INFORMATION</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>• Legal ID: <span className="font-mono font-semibold">{account.legalId}</span></p>
              <p>• Request ID: <span className="font-mono font-semibold">{account.requestId}</span></p>
              <p>• Status: <Badge variant="outline" className="ml-2">{account.status}</Badge></p>
              <p>• Submitted: {account.createdAt}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
