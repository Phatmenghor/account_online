"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { createPendingAccountHistoryTableColumns } from "@/components/shared/table/pending-account-history-content";
import {
  getAllPendingAccountsService,
  getReviewHistoryService,
} from "@/services/dashboard/open-account/pending-account.service";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
  ReviewHistoryResponseDto,
} from "@/models/open-account-admin/pending-account.response";
import PendingAccountDetailModal from "@/components/shared/modal/pending-account-detail";
import RequestAuditTrailModal from "@/components/shared/modal/request-audit-trail";
import { AppToast } from "@/components/shared/toast/app-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ReviewHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyData, setHistoryData] =
    useState<PaginationResponse<PendingAccountAdminReviewDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PendingAccountAdminReviewDto | null>(null);

  // Audit Trail Modal
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [auditTrailData, setAuditTrailData] =
    useState<ReviewHistoryResponseDto | null>(null);
  const [isAuditTrailLoading, setIsAuditTrailLoading] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { currentPage, handlePageChange } = usePagination({
    baseRoute: "/review-history",
  });

  // Load history from API
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      };

      if (statusFilter !== "ALL") {
        payload.status = statusFilter;
      }

      const response = await getAllPendingAccountsService(payload);
      setHistoryData(response);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      AppToast({
        type: "error",
        message: "Failed to load history",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, statusFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleViewDetail = (account: PendingAccountAdminReviewDto) => {
    setSelectedAccount(account);
    setIsDetailModalOpen(true);
  };

  const handleViewAuditTrail = async (
    account: PendingAccountAdminReviewDto
  ) => {
    setIsAuditTrailLoading(true);
    try {
      const response = await getReviewHistoryService(
        account.requestId || account.id
      );
      setAuditTrailData(response);
      setIsAuditTrailOpen(true);
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
      AppToast({
        type: "error",
        message: "Failed to load audit trail",
        description: "Please try again later",
      });
    } finally {
      setIsAuditTrailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedAccount(null);
    setIsDetailModalOpen(false);
  };

  const handleCloseAuditTrail = () => {
    setAuditTrailData(null);
    setIsAuditTrailOpen(false);
  };

  // Enhance columns to include audit trail button
  const columnsWithAuditTrail = createPendingAccountHistoryTableColumns({
    data: historyData,
    handlers: {
      handleViewDetail,
    },
  }).map((col) => {
    if (col.key === "actions") {
      return {
        ...col,
        render: (account: PendingAccountAdminReviewDto) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(account)}
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewAuditTrail(account)}
            >
              History
            </Button>
          </div>
        ),
      };
    }
    return col;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="search-history"
              type="search"
              placeholder="Search by Legal ID or Name"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 w-full text-xs h-9"
            />
          </div>

          <div className="w-[150px]">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              size="default"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <Separator className="bg-gray-300" />

        {/* TABLE */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={historyData?.content || []}
                columns={columnsWithAuditTrail}
                loading={isLoading}
                emptyMessage="No history records found"
                getRowKey={(account) => account.id ?? crypto.randomUUID()}
              />

              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={historyData?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL MODAL */}
        {selectedAccount && (
          <PendingAccountDetailModal
            account={selectedAccount}
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            isReadOnly={true}
          />
        )}

        {/* AUDIT TRAIL MODAL */}
        <RequestAuditTrailModal
          isOpen={isAuditTrailOpen}
          onClose={handleCloseAuditTrail}
          auditTrail={auditTrailData}
          isLoading={isAuditTrailLoading}
        />
      </CardContent>
    </Card>
  );
}

export default function ReviewHistoryPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReviewHistory />
    </Suspense>
  );
}
