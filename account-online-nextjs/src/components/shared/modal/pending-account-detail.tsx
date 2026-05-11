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
import { User, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import ImageDisplayCard from "@/components/shared/card/image-display-card";

interface PendingAccountDetailModalProps {
  account?: PendingAccountAdminReviewDto;
  isOpen: boolean;
  onClose: () => void;
  isReadOnly?: boolean;
}

interface CustomerData {
  title?: string;
  givenName?: string;
  familyName?: string;
  firstNameKh?: string;
  lastNameKh?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  phoneNumber?: string;
  email?: string;
  customerCurrentProvince?: string;
  customerCurrentDistrict?: string;
  customerCurrentCommune?: string;
  customerCurrentVillage?: string;
  legalAddress?: string;
  customerPobProvince?: string;
  customerPobDistrict?: string;
  customerPobCommune?: string;
  customerPobVillage?: string;
  placeOfBirth?: string;
  legalDocType?: string;
  legalHolderName?: string;
  legalIssAuth?: string;
  legalIssueDate?: string;
  legalExpireDate?: string;
  customerType?: string;
  companyName?: string;
  occupation?: string;
  industry?: string;
  sector?: string;
  averageIncome?: string;
  branchCode?: string;
  productAccount?: string;
  categoryAccount?: string;
  nidImageName?: string;
  selfieImageName?: string;
}

export default function PendingAccountDetailModal({
  account,
  isOpen,
  onClose,
  isReadOnly = false,
}: PendingAccountDetailModalProps) {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  useEffect(() => {
    if (account?.requestData) {
      // requestData is already parsed object from backend
      setCustomerData(account.requestData as CustomerData);
    }
  }, [account]);

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Pending Account Details
          </DialogTitle>
          <DialogDescription>
            Legal ID: {account.legalId}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="address">
              <FileText className="w-4 h-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger value="business">
              <AlertCircle className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
          </TabsList>

          {/* PERSONAL TAB */}
          <TabsContent value="personal" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DetailField
                    label="Status"
                    value={
                      <Badge variant="default">{account.status}</Badge>
                    }
                  />
                  <DetailField label="AML Status" value={account.amlStatus} />
                  <DetailField
                    label="Given Name"
                    value={customerData?.givenName}
                  />
                  <DetailField
                    label="Family Name"
                    value={customerData?.familyName}
                  />
                  <DetailField
                    label="First Name (Khmer)"
                    value={customerData?.firstNameKh}
                  />
                  <DetailField
                    label="Last Name (Khmer)"
                    value={customerData?.lastNameKh}
                  />
                  <DetailField label="Gender" value={customerData?.gender} />
                  <DetailField
                    label="Date of Birth"
                    value={customerData?.dateOfBirth}
                  />
                  <DetailField
                    label="Nationality"
                    value={customerData?.nationality}
                  />
                  <DetailField
                    label="Marital Status"
                    value={customerData?.maritalStatus}
                  />
                  <DetailField
                    label="Phone Number"
                    value={customerData?.phoneNumber}
                  />
                  <DetailField label="Email" value={customerData?.email} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ADDRESS TAB */}
          <TabsContent value="address" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Current Address
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Province"
                      value={customerData?.customerCurrentProvince}
                    />
                    <DetailField
                      label="District"
                      value={customerData?.customerCurrentDistrict}
                    />
                    <DetailField
                      label="Commune"
                      value={customerData?.customerCurrentCommune}
                    />
                    <DetailField
                      label="Village"
                      value={customerData?.customerCurrentVillage}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Place of Birth
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Province"
                      value={customerData?.customerPobProvince}
                    />
                    <DetailField
                      label="District"
                      value={customerData?.customerPobDistrict}
                    />
                    <DetailField
                      label="Commune"
                      value={customerData?.customerPobCommune}
                    />
                    <DetailField
                      label="Village"
                      value={customerData?.customerPobVillage}
                    />
                    <DetailField
                      label="Place of Birth"
                      value={customerData?.placeOfBirth}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Legal Address
                  </h4>
                  <p className="text-sm text-foreground">
                    {customerData?.legalAddress || "---"}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* BUSINESS TAB */}
          <TabsContent value="business" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Legal Document
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Document Type"
                      value={customerData?.legalDocType}
                    />
                    <DetailField
                      label="Holder Name"
                      value={customerData?.legalHolderName}
                    />
                    <DetailField
                      label="Issuing Authority"
                      value={customerData?.legalIssAuth}
                    />
                    <DetailField
                      label="Issue Date"
                      value={customerData?.legalIssueDate}
                    />
                    <DetailField
                      label="Expiration Date"
                      value={customerData?.legalExpireDate}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Employment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Customer Type"
                      value={customerData?.customerType}
                    />
                    <DetailField
                      label="Company Name"
                      value={customerData?.companyName}
                    />
                    <DetailField
                      label="Occupation"
                      value={customerData?.occupation}
                    />
                    <DetailField
                      label="Industry"
                      value={customerData?.industry}
                    />
                    <DetailField label="Sector" value={customerData?.sector} />
                    <DetailField
                      label="Average Income"
                      value={customerData?.averageIncome}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">Banking Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Branch Code"
                      value={customerData?.branchCode}
                    />
                    <DetailField
                      label="Product Account"
                      value={customerData?.productAccount}
                    />
                    <DetailField
                      label="Category Account"
                      value={customerData?.categoryAccount}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* IMAGES TAB */}
          <TabsContent value="images" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageDisplayCard
                  title="National ID"
                  imageName={customerData?.nidImageName}
                  imageType="nid"
                  legalId={account.legalId}
                />
                <ImageDisplayCard
                  title="Selfie"
                  imageName={customerData?.selfieImageName}
                  imageType="selfie"
                  legalId={account.legalId}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Remark Section */}
        {account.remark && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm font-medium text-amber-900">Remarks:</p>
            <p className="text-sm text-amber-800">{account.remark}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm text-foreground font-medium">
        {typeof value === "string" ? value || "---" : value || "---"}
      </p>
    </div>
  );
}
