"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable, TableColumn } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { History as HistoryIcon, Eye } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { AppToast } from "@/components/shared/toast/app-toast";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import RiskBadge from "@/components/shared/badge/risk-level-badge";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import AmlStatusFilter from "@/features/aml/components/aml-status-filter";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import JuniorAccountViewModal from "@/features/account-opening/components/junior-account-detail-modal";
import { getAllJuniorAmlHistoryService } from "@/features/aml/services/junior-aml-history.service";

function JuniorAmlHistoryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filters (matching Account Online AML history)
  const [statusFilter, setStatusFilter] = useState<AmlStatusEnum>(AmlStatusEnum.ALL);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.JUNIOR_AML_HISTORY,
  });

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        search: debouncedSearch,
        pageNo: currentPage,
        pageSize: 15,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      if (statusFilter !== AmlStatusEnum.ALL) {
        payload.status = statusFilter;
      }
      const resData = await getAllJuniorAmlHistoryService(payload);
      const content = resData?.content || [];
      setData(content);
      setTotalElements(resData?.totalElements || content.length);
      setTotalPages(resData?.totalPages || 1);
    } catch {
      AppToast({ type: "error", message: "Failed to fetch Junior AML History" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, statusFilter, startDate, endDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const columns: TableColumn<any>[] = [
    /** Index */
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },

    /** Legal ID */
    {
      key: "legalId",
      label: "ID Number",
      minWidth: "150px",
      truncate: true,
      render: (h) => <span>{h.legalId || "---"}</span>,
    },

    /** Child Name */
    {
      key: "fullName",
      label: "Child Name",
      minWidth: "200px",
      truncate: true,
      render: (h) => {
        const name = `${h.familyName || ""} ${h.givenName || ""}`.trim()
          || `${h.lastNameKh || ""} ${h.firstNameKh || ""}`.trim()
          || "---";
        return <span>{name}</span>;
      },
    },

    // Guardian Name
    // Branch
    // (removed — Junior AML history table matches Account Online AML columns exactly)

    /** Risk Level */
    {
      key: "riskLevel",
      label: "Risk Level",
      minWidth: "130px",
      render: (h) => (
        <RiskBadge riskLevel={h.amlExternalRiskLevel || h.amlRiskLevel || "---"} />
      ),
    },

    /** Score */
    {
      key: "totalRulesScore",
      label: "Score",
      minWidth: "80px",
      render: (h) => (
        <span className="font-semibold text-gray-700">
          {h.amlExternalTotalRulesScore ?? h.totalRulesScore ?? "---"}
        </span>
      ),
    },

    /** Created At */
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "180px",
      maxWidth: "600px",
      truncate: true,
      render: (h) =>
        h.createdAt ? (
          <span className="whitespace-nowrap">{DateTimeFormat(h.createdAt) || "---"}</span>
        ) : (
          "-"
        ),
    },

    /** Status */
    {
      key: "status",
      label: "Status",
      minWidth: "130px",
      render: (h) => <AmlStatusBadge status={h.status || "---"} />,
    },

    /** Action By */
    {
      key: "actionBy",
      label: "Action By",
      minWidth: "150px",
      truncate: true,
      render: (h) => {
        const actor =
          h.approvedBy?.fullName ||
          h.rejectedBy?.fullName ||
          h.approvedBy?.idCard ||
          h.rejectedBy?.idCard ||
          h.actionBy ||
          "---";
        return <span className="font-medium">{actor}</span>;
      },
    },

    /** Actions */
    {
      key: "actions",
      label: "Actions",
      minWidth: "100px",
      maxWidth: "100px",
      render: (history) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRecord(history);
                  setIsDetailOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Junior AML Audit History"
        subtitle="Audit trail of processed CPBank Junior AML review cases"
        icon={HistoryIcon}
        count={totalElements}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            searchPlaceholder="Search history..."
            searchAriaLabel="search-junior-aml-history"
            disabled={isLoading}
            leftFilters={
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-[150px]">
                  <AmlStatusFilter
                    selectedStatus={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
                <div className="w-[160px]">
                  <CustomDatePicker
                    value={startDate || ""}
                    onChange={setStartDate}
                    placeholder="Start Date"
                    className="w-full"
                  />
                </div>
                <div className="w-[160px]">
                  <CustomDatePicker
                    value={endDate || ""}
                    onChange={setEndDate}
                    placeholder="End Date"
                    className="w-full"
                  />
                </div>
              </div>
            }
          />

          <Separator className="bg-gray-300" />

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={data}
                  columns={columns}
                  loading={isLoading}
                  emptyMessage="No Junior AML history records found"
                  getRowKey={(history) => history.id ?? crypto.randomUUID()}
                />
                <div className="border-t bg-background p-2 flex justify-end">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VIEW DETAIL MODAL */}
          {selectedRecord && (
            <JuniorAccountViewModal
              history={selectedRecord}
              isOpen={isDetailOpen}
              onClose={() => {
                setIsDetailOpen(false);
                setSelectedRecord(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function JuniorAmlHistoryPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JuniorAmlHistoryContent />
    </Suspense>
  );
}
