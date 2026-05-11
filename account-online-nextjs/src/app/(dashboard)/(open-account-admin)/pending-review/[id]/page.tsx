"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  MapPin,
  Briefcase,
  FileText,
  Shield,
  Image as ImageIcon,
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
} from "lucide-react";
import Loading from "@/components/shared/common/loading";
import {
  DetailCard,
  InfoRow,
  InfoRowWithBadge,
  Divider,
} from "@/components/shared/card/account-detail-info-card";
import { PendingAccountAdminReviewDto } from "@/models/open-account-admin/pending-account.response";
import {
  getPendingAccountDetailService,
  approvePendingAccountService,
  rejectPendingAccountService,
} from "@/services/dashboard/open-account/pending-account.service";
import PendingAccountActionDialog from "@/components/shared/dialog/pending-account-action-dialog";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Badge } from "@/components/ui/badge";

export default function PendingAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [account, setAccount] = useState<PendingAccountAdminReviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchAccountDetail = async () => {
      setIsLoading(true);
      try {
        const data = await getPendingAccountDetailService(accountId);
        setAccount(data);
      } catch (error) {
        console.error("Failed to fetch account detail:", error);
        AppToast({
          type: "error",
          message: "Failed to load account details",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetail();
  }, [accountId]);

  const handleOpenApproveDialog = () => {
    setSelectedAction("APPROVE");
    setIsActionDialogOpen(true);
  };

  const handleOpenRejectDialog = () => {
    setSelectedAction("REJECT");
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = async (remark?: string) => {
    if (!account || !selectedAction) return;

    setIsActionLoading(true);
    try {
      if (selectedAction === "APPROVE") {
        await approvePendingAccountService({
          id: account.id,
          remark,
        });

        AppToast({
          type: "success",
          message: "Account approved successfully",
          description: `Account for ${account.givenName} ${account.familyName} has been approved.`,
        });
      } else if (selectedAction === "REJECT") {
        await rejectPendingAccountService({
          id: account.id,
          remark: remark || "No reason provided",
        });

        AppToast({
          type: "success",
          message: "Account rejected successfully",
          description: `Account for ${account.givenName} ${account.familyName} has been rejected.`,
        });
      }

      setTimeout(() => router.push("/pending-review"), 1000);
    } catch (error) {
      console.error("Error performing action:", error);
      AppToast({
        type: "error",
        message: "Failed to process action",
        description: "Please try again later",
      });
    } finally {
      setIsActionDialogOpen(false);
      setIsActionLoading(false);
      setSelectedAction(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!account) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium text-foreground">
              Account not found
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAmlBadgeVariant = (status: string) => {
    if (status === "PASS" || status === "CLEAR") return "default";
    if (status === "FAIL" || status === "BLOCKED") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mt-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {account.givenName} {account.familyName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Legal ID: {account.legalId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getAmlBadgeVariant(account.amlInfo?.status)}>
                AML: {account.amlInfo?.status || "---"}
              </Badge>
              <Badge variant="outline">
                {account.status || "PENDING"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <ScrollArea className="h-[calc(100vh-250px)] rounded-md border p-6">
        <div className="space-y-6 pr-6">
          {/* 1. Personal Information */}
          <DetailCard title="Personal Information" icon={User}>
            <div className="space-y-4">
              <InfoRow label="Given Name" value={account.givenName} />
              <InfoRow label="Family Name" value={account.familyName} />
              <InfoRow
                label="Khmer Name"
                value={`${account.firstNameKh} ${account.lastNameKh}`}
              />
              <InfoRow label="Gender" value={account.gender} />
              <InfoRow label="Date of Birth" value={account.dateOfBirth} />
              <InfoRow label="Nationality" value={account.nationality} />
              <InfoRow label="Marital Status" value={account.maritalStatus} />
              <InfoRow label="Phone Number" value={account.phoneNumber} />
              <InfoRow label="Email" value={account.email} />
            </div>
          </DetailCard>

          {/* 2. Current Address */}
          <DetailCard title="Current Address" icon={MapPin}>
            <div className="space-y-4">
              <InfoRow
                label="Province"
                value={account.currentAddress?.province}
              />
              <InfoRow
                label="District"
                value={account.currentAddress?.district}
              />
              <InfoRow
                label="Commune"
                value={account.currentAddress?.commune}
              />
              <InfoRow label="Village" value={account.currentAddress?.village} />
              <InfoRow label="Legal Address" value={account.legalAddress} />
            </div>
          </DetailCard>

          {/* 3. Place of Birth */}
          <DetailCard title="Place of Birth" icon={MapPin}>
            <div className="space-y-4">
              <InfoRow
                label="Province"
                value={account.placeOfBirth?.province}
              />
              <InfoRow
                label="District"
                value={account.placeOfBirth?.district}
              />
              <InfoRow label="Commune" value={account.placeOfBirth?.commune} />
              <InfoRow label="Village" value={account.placeOfBirth?.village} />
            </div>
          </DetailCard>

          {/* 4. Legal Document */}
          <DetailCard title="Legal Document" icon={FileText}>
            <div className="space-y-4">
              <InfoRow label="Document Type" value={account.legalDocument?.type} />
              <InfoRow label="Holder Name" value={account.legalDocument?.holderName} />
              <InfoRow
                label="Issue Date"
                value={account.legalDocument?.issueDate}
              />
              <InfoRow
                label="Expiration Date"
                value={account.legalDocument?.expirationDate}
              />
            </div>
          </DetailCard>

          {/* 5. Business/Employment Information */}
          <DetailCard title="Business & Employment" icon={Briefcase}>
            <div className="space-y-4">
              <InfoRow label="Company Name" value={account.businessInfo?.companyName} />
              <InfoRow label="Occupation" value={account.businessInfo?.occupation} />
              <InfoRow label="Industry" value={account.businessInfo?.industry} />
              <InfoRow label="Sector" value={account.businessInfo?.sector} />
              <InfoRow
                label="Monthly Income"
                value={account.businessInfo?.monthlyIncome}
              />
            </div>
          </DetailCard>

          {/* 6. Document Images */}
          <DetailCard title="Document Images" icon={ImageIcon}>
            <div className="space-y-6">
              {/* NID Image */}
              <div>
                <h4 className="text-sm font-medium mb-3">National ID Image</h4>
                {account.images?.nidImageUrl ? (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={account.images.nidImageUrl}
                      alt="National ID"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                    <span className="text-sm text-gray-400">No image uploaded</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  File: {account.images?.nidImageName || "---"}
                </p>
              </div>

              <Divider />

              {/* Selfie Image */}
              <div>
                <h4 className="text-sm font-medium mb-3">Selfie Image</h4>
                {account.images?.selfieImageUrl ? (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={account.images.selfieImageUrl}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                    <span className="text-sm text-gray-400">No image uploaded</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  File: {account.images?.selfieImageName || "---"}
                </p>
              </div>
            </div>
          </DetailCard>

          {/* 7. AML Information */}
          <DetailCard title="AML Screening Result" icon={Shield}>
            <div className="space-y-4">
              <InfoRowWithBadge
                label="AML Status"
                value={account.amlInfo?.status}
                badgeVariant={getAmlBadgeVariant(account.amlInfo?.status || "")}
              />
              <InfoRow label="Risk Level" value={account.amlInfo?.riskLevel} />
              <InfoRow
                label="Screening Result"
                value={account.amlInfo?.screeningResult}
              />
              <InfoRow
                label="Rules Triggered"
                value={account.amlInfo?.rulesTriggered}
              />
              <InfoRow
                label="Total Rules Score"
                value={account.amlInfo?.totalRulesScore?.toString()}
              />
              <InfoRow
                label="Action Taken"
                value={account.amlInfo?.actionTaken}
              />
              <InfoRow
                label="Service Name"
                value={account.amlInfo?.serviceName}
              />
            </div>
          </DetailCard>

          {/* 8. Additional Information */}
          <DetailCard title="Additional Information" icon={Calendar}>
            <div className="space-y-4">
              <InfoRow label="Request ID" value={account.requestId} />
              <InfoRow label="Account ID" value={account.id} />
              <InfoRow label="Referral ID" value={account.referralId} />
              <InfoRow label="Branch Code" value={account.branchCode} />
              <InfoRow
                label="Created At"
                value={new Date(account.createdAt).toLocaleString()}
              />
              <InfoRow
                label="Updated At"
                value={new Date(account.updatedAt).toLocaleString()}
              />
            </div>
          </DetailCard>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleOpenRejectDialog}
            >
              Reject Account
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleOpenApproveDialog}
            >
              Approve Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACTION DIALOG */}
      <PendingAccountActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        actionType={selectedAction || "APPROVE"}
        account={account}
        onConfirm={handleConfirmAction}
        isLoading={isActionLoading}
      />
    </div>
  );
}
