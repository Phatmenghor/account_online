"use client";

import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import {
  getAllPendingAccountsService,
  approvePendingAccountService,
  rejectPendingAccountService,
} from "@/services/dashboard/open-account/pending-account.service";
import { createPendingAccountTableColumns } from "@/components/shared/table/pending-account-content";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
} from "@/models/open-account-admin/pending-account.response";
import PendingAccountActionDialog from "@/components/shared/dialog/pending-account-action-dialog";
import PendingAccountDetailModal from "@/components/shared/modal/pending-account-detail";
import { AppToast } from "@/components/shared/toast/app-toast";

function PendingReview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAccounts, setPendingAccounts] =
    useState<PaginationResponse<PendingAccountAdminReviewDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PendingAccountAdminReviewDto | null>(null);

  // Action Dialog
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAccountForAction, setSelectedAccountForAction] =
    useState<PendingAccountAdminReviewDto | null>(null);
  const [selectedAction, setSelectedAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const searchParams = useSearchParams();
  const t = useTranslations();
  const router = useRouter();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: "/pending-review",
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadPendingAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllPendingAccountsService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: "PENDING",
      });
      setPendingAccounts(response);
    } catch (error) {
      console.error("Failed to fetch pending accounts:", error);
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
    loadPendingAccounts();
  }, [loadPendingAccounts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewDetail = (account: PendingAccountAdminReviewDto) => {
    setSelectedAccount(account);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedAccount(null);
    setIsDetailModalOpen(false);
  };

  const openApproveDialog = (account: PendingAccountAdminReviewDto) => {
    setSelectedAccountForAction(account);
    setSelectedAction("APPROVE");
    setIsActionDialogOpen(true);
  };

  const openRejectDialog = (account: PendingAccountAdminReviewDto) => {
    setSelectedAccountForAction(account);
    setSelectedAction("REJECT");
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = async (remark?: string) => {
    if (!selectedAccountForAction || !selectedAction) return;

    setIsActionLoading(true);
    try {
      if (selectedAction === "APPROVE") {
        await approvePendingAccountService({
          requestId: selectedAccountForAction.requestId,
          remark,
        });

        setPendingAccounts((prev) => {
          if (!prev) return null;
          const updatedList = prev.content.filter(
            (item) => item.requestId !== selectedAccountForAction.requestId
          );
          return {
            ...prev,
            content: updatedList,
            totalElements: updatedList.length,
          };
        });

        const customerName = `${selectedAccountForAction.legalLastNameEn || ""} ${selectedAccountForAction.legalFirstNameEn || ""}`.trim() || "Unknown";

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Account Approved Successfully",
            description: `Request ${selectedAccountForAction.requestId} - ${customerName} approved`,
          });
        });
      } else if (selectedAction === "REJECT") {
        const rejectResponse = await rejectPendingAccountService({
          requestId: selectedAccountForAction.requestId,
          remark: remark || "No reason provided",
        });

        setPendingAccounts((prev) => {
          if (!prev) return null;
          const updatedList = prev.content.filter(
            (item) => item.requestId !== selectedAccountForAction.requestId
          );
          return {
            ...prev,
            content: updatedList,
            totalElements: updatedList.length,
          };
        });

        const customerName = `${selectedAccountForAction.legalLastNameEn || ""} ${selectedAccountForAction.legalFirstNameEn || ""}`.trim() || "Unknown";

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Account Rejected Successfully",
            description: `Request ${selectedAccountForAction.requestId} - ${customerName} rejected`,
          });
        });
      }
    } catch (error: any) {
      console.error("Error performing action:", error);
      
      // Extract specific error message from backend
      const errorMessage = error?.errorMessage || error?.message || "Failed to process action";
      const errorDescription = error?.rawError?.message || "Please try again later";
      
      AppToast({
        type: "error",
        message: errorMessage,
        description: errorDescription,
      });
    } finally {
      setIsActionDialogOpen(false);
      setIsActionLoading(false);
      setSelectedAccountForAction(null);
      setSelectedAction(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-pending-accounts"
                type="search"
                placeholder="Search by Legal ID or Name"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-gray-300" />

        {/* TABLE */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={pendingAccounts?.content || []}
                columns={createPendingAccountTableColumns({
                  data: pendingAccounts,
                  handlers: {
                    handleViewDetail,
                    openApproveDialog,
                    openRejectDialog,
                  },
                })}
                loading={isLoading}
                emptyMessage="No pending account requests found"
                getRowKey={(account) => account.requestId?.toString() ?? crypto.randomUUID()}
              />

              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={pendingAccounts?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL MODAL */}
        <PendingAccountDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          account={selectedAccount || undefined}
          onApprove={(account) => {
            setIsDetailModalOpen(false);
            openApproveDialog(account);
          }}
          onReject={(account) => {
            setIsDetailModalOpen(false);
            openRejectDialog(account);
          }}
        />

        {/* ACTION DIALOG */}
        <PendingAccountActionDialog
          isOpen={isActionDialogOpen}
          onClose={() => setIsActionDialogOpen(false)}
          actionType={selectedAction || "APPROVE"}
          account={selectedAccountForAction || undefined}
          onConfirm={handleConfirmAction}
          isLoading={isActionLoading}
        />
      </CardContent>
    </Card>
  );
}

export default function PendingReviewPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PendingReview />
    </Suspense>
  );
}
