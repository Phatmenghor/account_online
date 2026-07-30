"use client";

import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { ShieldAlert, CheckCircle, XCircle, Eye } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { AppToast } from "@/components/shared/toast/app-toast";
import RiskBadge from "@/components/shared/badge/risk-level-badge";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import AmlStatusFilter from "@/features/aml/components/aml-status-filter";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import AmlConfirmDialog from "@/components/shared/dialog/dialog-aml";
import JuniorAccountViewModal from "@/features/account-opening/components/junior-account-detail-modal";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import {
  getAllJuniorAmlManagementService,
  updateJuniorAmlManagementService,
} from "@/features/aml/services/junior-aml-management.service";

function JuniorAmlManagementContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AmlStatusEnum>(AmlStatusEnum.PENDING);

  // Detail Modal & Confirm Dialog
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<AmlStatusEnum>(AmlStatusEnum.APPROVE);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.JUNIOR_AML_MANAGEMENT,
  });

  const loadAmlManagement = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        search: debouncedSearch,
        pageNo: currentPage,
        pageSize: 15,
      };
      if (statusFilter !== AmlStatusEnum.ALL) {
        payload.status = statusFilter;
      }
      const resData = await getAllJuniorAmlManagementService(payload);
      const content = resData?.content || [];
      setData(content);
      setTotalElements(resData?.totalElements || content.length);
      setTotalPages(resData?.totalPages || 1);
    } catch {
      AppToast({ type: "error", message: "Failed to fetch Junior AML records" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, statusFilter]);

  useEffect(() => {
    loadAmlManagement();
  }, [loadAmlManagement]);

  const handleOpenConfirm = (record: any, status: AmlStatusEnum) => {
    setSelectedRecord(record);
    setConfirmStatus(status);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async (remarks?: string) => {
    if (!selectedRecord) return;
    setIsConfirmLoading(true);
    try {
      await updateJuniorAmlManagementService(selectedRecord.id, {
        status: confirmStatus,
        remark: remarks || "",
      });

      // Optimistic update — remove the processed record
      setData((prev) => prev.filter((item) => item.id !== selectedRecord.id));
      setTotalElements((prev) => Math.max(0, prev - 1));

      startTransition(() => {
        AppToast({
          type: "success",
          message: `Junior AML ${confirmStatus} successfully`,
          description: `Case has been ${confirmStatus.toLowerCase()}.`,
        });
      });

      setIsConfirmDialogOpen(false);
      setSelectedRecord(null);
      loadAmlManagement();
    } catch (err) {
      console.error(err);
      AppToast({ type: "error", message: "Failed to update Junior AML status" });
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const columns: TableColumn<any>[] = [
    // Index
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },

    // Legal ID
    {
      key: "legalId",
      label: "ID Number",
      truncate: true,
      maxWidth: "250px",
      minWidth: "20px",
      render: (item) => (
        <span className="font-medium">{item.legalId || "---"}</span>
      ),
    },

    // Junior / Child Name
    {
      key: "customerName",
      label: "Child Name",
      truncate: true,
      maxWidth: "240px",
      minWidth: "180px",
      render: (item) => {
        const name = `${item.familyName || ""} ${item.givenName || ""}`.trim()
          || `${item.lastNameKh || ""} ${item.firstNameKh || ""}`.trim()
          || "---";
        return <span className="font-medium">{name}</span>;
      },
    },

    // Guardian Name
    // Branch
    // (removed — Junior AML table matches Account Online AML columns exactly)

    // Risk Level
    {
      key: "riskLevel",
      label: "Risk Level",
      truncate: true,
      maxWidth: "130px",
      minWidth: "100px",
      render: (item) => (
        <RiskBadge riskLevel={item.amlExternalRiskLevel || item.amlRiskLevel || "---"} />
      ),
    },

    // Score
    {
      key: "totalRulesScore",
      label: "Score",
      maxWidth: "100px",
      minWidth: "80px",
      render: (item) => (
        <span className="font-medium">{item.amlExternalTotalRulesScore ?? item.totalRulesScore ?? "---"}</span>
      ),
    },

    // Created At
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "200px",
      minWidth: "180px",
      render: (item) => (
        <span className="font-medium whitespace-nowrap">
          {DateTimeFormat(item.createdAt) || "---"}
        </span>
      ),
    },

    // Status
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "120px",
      minWidth: "120px",
      render: (item) => <AmlStatusBadge status={item.status || "---"} />,
    },

    // Actions
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (item) => (
        <div className="flex items-center gap-2">
          {/* View */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRecord(item);
                    setIsDetailOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {item.status === "PENDING" && (
            <>
              {/* Approve */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenConfirm(item, AmlStatusEnum.APPROVE)}
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Approve</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Reject */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenConfirm(item, AmlStatusEnum.REJECT)}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reject</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Junior AML Management"
        subtitle="Review and process flagged CPBank Junior AML screening cases"
        icon={ShieldAlert}
        count={totalElements}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            searchPlaceholder="Search by NID, Name..."
            searchAriaLabel="search-junior-aml"
            disabled={isLoading}
            leftFilters={
              <AmlStatusFilter selectedStatus={statusFilter} onChange={setStatusFilter} />
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
                  emptyMessage="No Junior AML cases found"
                  getRowKey={(item) => item.id}
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

          {/* CONFIRM DIALOG */}
          <AmlConfirmDialog
            isLoading={isConfirmLoading}
            isOpen={isConfirmDialogOpen}
            onClose={() => setIsConfirmDialogOpen(false)}
            status={confirmStatus}
            onConfirm={handleConfirmAction}
          />

          {/* VIEW DETAIL MODAL */}
          <JuniorAccountViewModal
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedRecord(null);
            }}
            account={selectedRecord ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function JuniorAmlManagementPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JuniorAmlManagementContent />
    </Suspense>
  );
}
