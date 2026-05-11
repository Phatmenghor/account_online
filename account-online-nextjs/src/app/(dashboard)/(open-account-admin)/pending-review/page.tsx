"use client";

import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Loading from "@/components/shared/common/loading";
import { createPendingAccountTableColumns } from "@/components/shared/table/pending-account-content";
import AccountReviewDialog from "@/components/shared/dialog/dialog-account-review";
import { AppToast } from "@/components/shared/toast/app-toast";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
} from "@/models/open-account-admin/pending-account.response";
import {
  getAllPendingAccountsService,
  approvePendingAccountService,
  rejectPendingAccountService,
} from "@/services/dashboard/open-account/pending-account.service";

function PendingAccountReview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountData, setAccountData] =
    useState<PaginationResponse<PendingAccountAdminReviewDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Review Dialog
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [selectedAccount, setSelectedAccount] =
    useState<PendingAccountAdminReviewDto | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const searchParams = useSearchParams();
  const t = useTranslations();
  const router = useRouter();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: `${ROUTES.DASHBOARD.INDEX}/open-account-admin/pending-review`,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllPendingAccountsService({
        pageNo: currentPage,
        pageSize: 15,
        search: debouncedSearchQuery,
        status: "PENDING",
      });
      setAccountData(response);
    } catch (error) {
      console.error("❌ Failed to fetch pending accounts:", error);
      AppToast({
        type: "error",
        message: "Failed to load pending accounts",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // HANDLERS
  const handleViewDetail = (account: PendingAccountAdminReviewDto) => {
    router.push(
      `${ROUTES.DASHBOARD.INDEX}/open-account-admin/pending-review/${account.id}`
    );
  };

  const handleApproveClick = (account: PendingAccountAdminReviewDto) => {
    setSelectedAccount(account);
    setReviewAction("approve");
    setIsReviewDialogOpen(true);
  };

  const handleRejectClick = (account: PendingAccountAdminReviewDto) => {
    setSelectedAccount(account);
    setReviewAction("reject");
    setIsReviewDialogOpen(true);
  };

  const handleConfirmReview = async (remark?: string) => {
    if (!selectedAccount) return;

    setIsReviewLoading(true);
    try {
      if (reviewAction === "approve") {
        await approvePendingAccountService({
          id: selectedAccount.id,
          remark,
        });

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Account approved successfully",
            description: "The account opening request has been approved.",
          });
        });
      } else {
        await rejectPendingAccountService({
          id: selectedAccount.id,
          remark: remark || "No reason provided",
        });

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Account rejected successfully",
            description: "The account opening request has been rejected.",
          });
        });
      }

      // Remove the approved/rejected item from the list
      setAccountData((prev: any) => {
        if (!prev) return null;

        const updatedList = prev.content.filter(
          (item: any) => item.id !== selectedAccount.id
        );

        return {
          ...prev,
          content: updatedList,
          totalElements: prev.totalElements - 1,
        };
      });
    } catch (error) {
      console.error("Error updating account status:", error);
      AppToast({
        type: "error",
        message: `Failed to ${reviewAction} account`,
        description: "Please try again later",
      });
    } finally {
      setIsReviewDialogOpen(false);
      setIsReviewLoading(false);
      setSelectedAccount(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Pending Account Review</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve/reject new account opening requests
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center justify-start gap-4 w-full">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="search-pending-accounts"
              type="search"
              placeholder="Search by Legal ID, Name, or Phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
            />
          </div>
        </div>

        <Separator className="bg-gray-300" />

        {/* TABLE */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={accountData?.content || []}
                columns={createPendingAccountTableColumns({
                  data: accountData,
                  handlers: {
                    handleViewDetail,
                    handleApproveClick,
                    handleRejectClick,
                  },
                })}
                loading={isLoading}
                emptyMessage="No pending account requests found"
                getRowKey={(account) => account.id ?? crypto.randomUUID()}
              />

              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={accountData?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* REVIEW DIALOG */}
        <AccountReviewDialog
          isOpen={isReviewDialogOpen}
          isLoading={isReviewLoading}
          onClose={() => setIsReviewDialogOpen(false)}
          action={reviewAction}
          onConfirm={handleConfirmReview}
          accountDetails={
            selectedAccount
              ? {
                  id: selectedAccount.id,
                  legalId: selectedAccount.legalId,
                  name: `${selectedAccount.givenName} ${selectedAccount.familyName}`,
                  phoneNumber: selectedAccount.phoneNumber,
                }
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}

export default function PendingReviewPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PendingAccountReview />
    </Suspense>
  );
}
