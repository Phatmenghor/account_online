"use client";

import Loading from "@/components/shared/common/loading";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search, User } from "lucide-react";
import { useState, useCallback, Suspense } from "react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAccountOnlineService } from "@/services/get-account/acc-online.service";
import { GetAccountModel } from "@/models/acc-online-get/account-online.response";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";
import { DateTimeFormat } from "@/utils/date/date-time-format";

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 gap-4">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">
        {label}:
      </Label>
      <span className="text-sm font-semibold text-right">{value || "N/A"}</span>
    </div>
  );
}

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1 h-6 ${color} rounded-full`} />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

function AccountPageContent() {
  const [searchCif, setSearchCif] = useState("");
  const [searchLegalId, setSearchLegalId] = useState("");
  const [account, setAccount] = useState<GetAccountModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedCif = useDebounce(searchCif, 400);
  const debouncedLegalId = useDebounce(searchLegalId, 400);

  const fetchingAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAccountOnlineService({
        cif: searchCif,
        legalId: searchLegalId,
      });
      if (response) {
        AppToast({ type: "success", message: response?.message });
        setAccount(response);
      } else {
        AppToast({ type: "error", message: "No data found." });
      }
    } catch (error: any) {
      console.error("Failed to fetch account:", error);
      AppToast({ type: "error", message: error.errorMessage || "Failed to fetch account." });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedCif, debouncedLegalId]);

  const handleSearch = () => {
    setAccount(null);
    fetchingAccount();
  };

  const data = account?.data;

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full space-y-4">
        {/* Search bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoComplete="off"
              type="search"
              placeholder="Enter CIF..."
              value={searchCif}
              onChange={(e) => setSearchCif(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoComplete="off"
              type="search"
              placeholder="Enter Legal ID..."
              value={searchLegalId}
              onChange={(e) => setSearchLegalId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        <Separator />

        {/* Result */}
        {isLoading ? (
          <Loading />
        ) : data ? (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-6 pb-4">

              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {[data.legalFirstNameEn, data.legalLastNameEn].filter(Boolean).join(" ") || "Account Details"}
                  </p>
                  <p className="text-sm text-muted-foreground">CIF: {data.cif} · Legal ID: {data.legalId}</p>
                </div>
              </div>

              <Separator />

              {/* Document Images */}
              {(data.nidImageName || data.selfieImageName) && (
                <>
                  <div className="space-y-4">
                    <SectionHeader color="bg-teal-600" title="Document Images" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.nidImageName && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">NID / ID Card</p>
                          <ImagePreviewCell imageId={data.nidImageName} label="NID / ID Card" className="w-full h-64" />
                        </div>
                      )}
                      {data.selfieImageName && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selfie Photo</p>
                          <ImagePreviewCell imageId={data.selfieImageName} label="Selfie Photo" className="w-full h-64" />
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <SectionHeader color="bg-blue-600" title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="CIF" value={data.cif} />
                  <InfoRow label="Legal ID" value={data.legalId} />
                  <InfoRow label="First Name (EN)" value={data.legalFirstNameEn} />
                  <InfoRow label="Last Name (EN)" value={data.legalLastNameEn} />
                  <InfoRow label="First Name (KH)" value={data.legalFirstNameKh} />
                  <InfoRow label="Last Name (KH)" value={data.legalLastNameKh} />
                  <InfoRow label="Date of Birth" value={data.legalDateOfBirth} />
                  <InfoRow label="Gender" value={data.legalGender} />
                  <InfoRow label="Marital Status" value={data.maritalStatus} />
                  <InfoRow label="Nationality" value={data.nationality} />
                  <InfoRow label="Phone Number" value={data.phoneNumber} />
                  <InfoRow label="Occupation" value={data.occupation} />
                  <InfoRow label="Company Name" value={data.companyName} />
                  <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground shrink-0">Address:</Label>
                    <span className="text-sm font-semibold text-right">{data.legalAddress || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 gap-4 md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground shrink-0">Place of Birth:</Label>
                    <span className="text-sm font-semibold text-right">{data.legalPlaceOfBirth || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Information */}
              <div className="space-y-4">
                <SectionHeader color="bg-gray-600" title="System Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Created By" value={data.createdBy} />
                  <InfoRow label="Created At" value={DateTimeFormat(data.createdAt)} />
                  <InfoRow label="Updated By" value={data.updatedBy} />
                  <InfoRow label="Updated At" value={DateTimeFormat(data.updatedAt)} />
                </div>
              </div>

            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Enter a CIF or Legal ID and press Search to view account details.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountPageContent />
    </Suspense>
  );
}
