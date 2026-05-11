"use client";

import {
  User,
  Shield,
  MapPin,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Calendar,
  Phone,
  Mail,
  ClipboardCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PendingAccountAdminReviewDto } from "@/models/open-account-admin/pending-account.response";
import { getPendingAccountDetailService } from "@/services/dashboard/open-account/pending-account.service";

interface PendingAccountDetailModalProps {
  account?: PendingAccountAdminReviewDto;
  accountId?: string;
  isOpen: boolean;
  onClose: () => void;
  isReadOnly?: boolean;
  onApprove?: (account: PendingAccountAdminReviewDto) => void;
  onReject?: (account: PendingAccountAdminReviewDto) => void;
}

export default function PendingAccountDetailModal({
  account: initialAccount,
  accountId,
  isOpen,
  onClose,
  isReadOnly = false,
  onApprove,
  onReject,
}: PendingAccountDetailModalProps) {
  const [account, setAccount] = useState<PendingAccountAdminReviewDto | undefined>(
    initialAccount,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialAccount) {
      setAccount(initialAccount);
      return;
    }

    if (accountId) {
      const fetchAccount = async () => {
        setLoading(true);
        try {
          const data = await getPendingAccountDetailService(accountId);
          setAccount(data);
        } catch (err) {
          console.error("Failed to fetch pending account:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAccount();
    }
  }, [accountId, initialAccount, isOpen]);

  const handleClose = () => onClose();

  const getAmlBadgeVariant = (status: string) => {
    if (status === "PASS" || status === "CLEAR") return "default";
    if (status === "FAIL" || status === "BLOCKED") return "destructive";
    return "secondary";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-foreground" />
            </div>

            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Account Details
              </DialogTitle>

              <DialogDescription className="text-base text-muted-foreground">
                {account ? `${account.givenName} ${account.familyName}` : "Loading..."}
              </DialogDescription>

              {/* Status Badges */}
              {account && (
                <div className="mt-2 flex gap-2">
                  <Badge variant={getAmlBadgeVariant(account.amlInfo?.status)}>
                    AML: {account.amlInfo?.status || "---"}
                  </Badge>
                  <Badge variant="outline">
                    {account.status || "PENDING"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading account details...
              </div>
            ) : !account ? (
              <div className="text-center text-muted-foreground">
                No account data available
              </div>
            ) : (
              <>
                {/* 1. Personal Information */}
                <Section
                  title="Personal Information"
                  icon={<User className="h-5 w-5" />}
                >
                  <InfoRow label="Legal ID" value={account.legalId} />
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
                </Section>

                {/* 2. Current Address */}
                <Section
                  title="Current Address"
                  icon={<MapPin className="h-5 w-5" />}
                >
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
                  <InfoRow
                    label="Legal Address"
                    value={account.legalAddress}
                    className="md:col-span-2"
                  />
                </Section>

                {/* 3. Place of Birth */}
                <Section
                  title="Place of Birth"
                  icon={<MapPin className="h-5 w-5" />}
                >
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
                </Section>

                {/* 4. Legal Document */}
                <Section
                  title="Legal Document"
                  icon={<FileText className="h-5 w-5" />}
                >
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
                </Section>

                {/* 5. Business/Employment Information */}
                <Section
                  title="Business & Employment"
                  icon={<Briefcase className="h-5 w-5" />}
                >
                  <InfoRow label="Company Name" value={account.businessInfo?.companyName} />
                  <InfoRow label="Occupation" value={account.businessInfo?.occupation} />
                  <InfoRow label="Industry" value={account.businessInfo?.industry} />
                  <InfoRow label="Sector" value={account.businessInfo?.sector} />
                  <InfoRow
                    label="Monthly Income"
                    value={account.businessInfo?.monthlyIncome}
                  />
                </Section>

                {/* 6. Document Images */}
                <Section
                  title="Document Images"
                  icon={<ImageIcon className="h-5 w-5" />}
                >
                  <div className="md:col-span-2 space-y-6">
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

                    <div className="border-t" />

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
                </Section>

                {/* 7. AML Information */}
                <Section
                  title="AML Screening Result"
                  icon={<Shield className="h-5 w-5" />}
                >
                  <InfoRow
                    label="AML Status"
                    value={
                      <Badge variant={getAmlBadgeVariant(account.amlInfo?.status || "")}>
                        {account.amlInfo?.status || "---"}
                      </Badge>
                    }
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
                </Section>

                {/* 8. Additional Information */}
                <Section
                  title="Additional Information"
                  icon={<Calendar className="h-5 w-5" />}
                >
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
                </Section>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0 justify-between">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {!isReadOnly && account && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => onReject?.(account)}
              >
                Reject
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => onApprove?.(account)}
              >
                Approve
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Section = ({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 ${className}`}
  >
    <div className="flex items-center gap-2 pb-2 border-b">
      {icon && <div className="text-primary">{icon}</div>}
      <h3 className="text-lg font-semibold leading-none tracking-tight">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
      {children}
    </div>
  </div>
);

const InfoRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </Label>
    <div className="text-sm font-medium break-words text-foreground">
      {value ?? <span className="text-muted-foreground/40 italic">N/A</span>}
    </div>
  </div>
);
