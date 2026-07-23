"use client";

import { Suspense, useCallback, useEffect, useState } from "react";

import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { PageHeader } from "@/components/shared/common/page-header";
import { Search, History as HistoryIcon } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { createHistoryTableColumns } from "@/features/aml/table/aml-history-content";
import { getAllAmlHistoryService } from "@/features/aml/services/aml-history.service";
import {
  AllHistoryModel,
  HistoryModel,
} from "@/features/aml/types/history/response/history-response.model";
import AmlHistoryDetailModal from "@/features/aml/components/aml-history-detail";
import AmlStatusFilter from "@/features/aml/components/aml-status-filter";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";

function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyData, setHistoryData] = useState<AllHistoryModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<HistoryModel | null>(null);
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<AmlStatusEnum>(
    AmlStatusEnum.ALL
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.AML.HISTORY,
  });

  // Load history from API
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      // Only include status if it's PENDING, APPROVE, or REJECT
      if (statusFilter !== AmlStatusEnum.ALL) {
        payload.status = statusFilter;
      }

      const response = await getAllAmlHistoryService(payload);
      setHistoryData(response);
    } catch (error) {
      console.error("❌ Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, statusFilter, startDate, endDate]);

  // Reload whenever search, page, status, or dates change
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (status: AmlStatusEnum) => {
    setStatusFilter(status);
  };

  const handleViewHistoryDetail = (history: HistoryModel) => {
    setSelectedHistoryRecord(history);
    setIsHistoryDetailOpen(true);
  };



  return (
    <div className="space-y-4">
      <PageHeader
        title="AML Audit History"
        subtitle="Audit trail of processed AML review cases"
        icon={HistoryIcon}
        count={historyData?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          {/* HEADER */}
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-history"
                type="search"
                placeholder="Search history..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
              />
            </div>

            {/* Status Filter */}
            <div className="w-[150px]">
              <AmlStatusFilter
                selectedStatus={statusFilter}
                onChange={handleStatusChange}
              />
            </div>

            {/* Start Date */}
            <div className="w-[170px]">
              <span className="text-[10px] text-muted-foreground block mb-1">
                Start Date
              </span>
              <CustomDatePicker
                value={startDate || ""}
                onChange={setStartDate}
                placeholder="Start Date"
                className="w-full"
              />
            </div>

            {/* End Date */}
            <div className="w-[170px]">
              <span className="text-[10px] text-muted-foreground block mb-1">
                End Date
              </span>
              <CustomDatePicker
                value={endDate || ""}
                onChange={setEndDate}
                placeholder="End Date"
                className="w-full"
              />
            </div>

          </div>

          <Separator className="bg-gray-300" />

          {/* TABLE */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={historyData?.content || []}
                  columns={createHistoryTableColumns({
                    data: historyData,
                    handlers: { handleViewHistoryDetail },
                  })}
                  loading={isLoading}
                  emptyMessage="No history records found"
                  getRowKey={(history) => history.id ?? crypto.randomUUID()}
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

          {/* MODALS */}
          {selectedHistoryRecord && (
            <AmlHistoryDetailModal
              history={selectedHistoryRecord}
              isOpen={isHistoryDetailOpen}
              onClose={() => setIsHistoryDetailOpen(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<Loading />}>
      <History />
    </Suspense>
  );
}


