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
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    if (account?.requestData && typeof account.requestData === "object") {
      setCustomerData(account.requestData);
    }
  }, [account]);

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

        {customerData ? (
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
                    {displayField("Title", customerData.title)}
                    {displayField("Given Name", customerData.givenName || customerData.given_name)}
                    {displayField("Family Name", customerData.familyName || customerData.family_name)}
                    {displayField("First Name (Khmer)", customerData.firstNameKh)}
                    {displayField("Last Name (Khmer)", customerData.lastNameKh)}
                    {displayField("Gender", customerData.gender)}
                    {displayField("Date of Birth", customerData.dateOfBirth || customerData.date_of_birth)}
                    {displayField("Nationality", customerData.nationality)}
                    {displayField("Marital Status", customerData.maritalStatus || customerData.marital_status)}
                    {displayField("Phone Number", customerData.phoneNumber || customerData.sms)}
                    {displayField("Email", customerData.email)}
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
                      {displayField("Province", customerData.customerCurrentProvince || customerData.cust_province)}
                      {displayField("District", customerData.customerCurrentDistrict || customerData.cust_district)}
                      {displayField("Commune", customerData.customerCurrentCommune || customerData.cust_commune)}
                      {displayField("Village", customerData.customerCurrentVillage || customerData.cust_village)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Place of Birth</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {displayField("Province", customerData.customerPobProvince || customerData.cust_pob_province)}
                      {displayField("District", customerData.customerPobDistrict || customerData.cust_pob_district)}
                      {displayField("Commune", customerData.customerPobCommune || customerData.cust_pob_commune)}
                      {displayField("Village", customerData.customerPobVillage || customerData.cust_pob_village)}
                      {displayField("Place of Birth", customerData.placeOfBirth || customerData.place_of_birth)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Legal Address</h4>
                    <p className="text-sm text-foreground">
                      {customerData.legalAddress || customerData.address || "---"}
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
                    {displayField("Document Type", customerData.legalDocType || customerData.legal_doc_name)}
                    {displayField("Holder Name", customerData.legalHolderName || customerData.legal_holder_name)}
                    {displayField("Issuing Authority", customerData.legalIssAuth || customerData.legal_iss_auth)}
                    {displayField("Issue Date", customerData.legalIssueDate || customerData.legal_iss_date || customerData.issuedDate)}
                    {displayField("Expiration Date", customerData.legalExpireDate || customerData.legal_exp_date || customerData.expiredDate)}
                  </div>

                  {customerData.legalMrz1 && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h4 className="font-semibold text-sm mb-2">Machine Readable Zone (MRZ)</h4>
                      <div className="font-mono text-xs space-y-1">
                        <p>{customerData.legalMrz1 || customerData.legalMRZ1}</p>
                        <p>{customerData.legalMrz2 || customerData.legalMRZ2}</p>
                        <p>{customerData.legalMrz3 || customerData.legalMRZ3}</p>
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
                      {displayField("Customer Type", customerData.customerType || customerData.customer_type)}
                      {displayField("Company Name", customerData.companyName || customerData.company)}
                      {displayField("Occupation", customerData.occupation)}
                      {displayField("Industry", customerData.industry)}
                      {displayField("Sector", customerData.sector)}
                      {displayField("Average Income", customerData.averageIncome || customerData.average_income)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Banking Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {displayField("Branch Code", customerData.branchCode || customerData.branch_code)}
                      {displayField("Product Account", customerData.productAccount || customerData.product_account)}
                      {displayField("Category Account", customerData.categoryAccount || customerData.category_account)}
                      {displayField("Customer Role", customerData.customerRole || customerData.customer_role)}
                      {displayField("Loan Officer", customerData.loanOfficer || customerData.loan_officer)}
                      {displayField("Released By", customerData.releasedBy || customerData.released_by)}
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
                    imageName={customerData.nidImageName || customerData.nid_image_name}
                    imageType="nid"
                    legalId={account.legalId}
                  />
                  <ImageDisplayCard
                    title="Selfie Photo"
                    imageName={customerData.selfieImageName || customerData.selfie_image_name}
                    imageType="selfie"
                    legalId={account.legalId}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No customer data available
          </div>
        )}

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
