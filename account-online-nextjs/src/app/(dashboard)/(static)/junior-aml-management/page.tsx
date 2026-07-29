"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable, TableColumn } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { ShieldAlert, Check, X, Eye } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { AppToast } from "@/components/shared/toast/app-toast";
import AmlStatusFilter from "@/features/aml/components/aml-status-filter";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import AmlConfirmDialog from "@/components/shared/dialog/dialog-aml";
import JuniorAccountViewModal from "@/features/account-opening/components/junior-account-detail-modal";
import { ActionButton } from "@/components/shared/button/custom-button";
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
      // Real-time local state removal
      setData((prev) => prev.filter((item) => item.id !== selectedRecord.id));
      setTotalElements((prev) => Math.max(0, prev - 1));

      AppToast({
        type: "success",
        message: `Junior AML Case successfully ${confirmStatus.toLowerCase()}d`,
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
    {
      key: "cif",
      label: "CIF",
      minWidth: "120px",
      render: (item) => <span className="font-mono text-xs font-bold">{item.cif || "---"}</span>,
    },
    {
      key: "legalId",
      label: "Legal ID",
      minWidth: "130px",
      render: (item) => <span className="text-xs font-medium">{item.legalId || "---"}</span>,
    },
    {
      key: "legalHolderName",
      label: "Holder Name",
      minWidth: "160px",
      render: (item) => <span className="text-xs font-semibold">{item.legalHolderName || "---"}</span>,
    },
    {
      key: "guardianName",
      label: "Guardian Name",
      minWidth: "150px",
      render: (item) => <span className="text-xs font-medium">{item.guardianName || "---"}</span>,
    },
    {
      key: "amlRiskLevel",
      label: "Risk Level",
      minWidth: "110px",
      render: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            item.amlRiskLevel === "HIGH"
              ? "bg-red-100 text-red-800"
              : item.amlRiskLevel === "MEDIUM"
              ? "bg-amber-100 text-amber-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {item.amlRiskLevel || "MEDIUM"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: "110px",
      render: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            item.status === "APPROVE"
              ? "bg-emerald-100 text-emerald-800"
              : item.status === "REJECT"
              ? "bg-rose-100 text-rose-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {item.status || "PENDING"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "140px",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {item.status === "PENDING" && (
            <>
              <ActionButton
                icon={<Check className="h-4 w-4 text-emerald-600" />}
                tooltip="Approve Case"
                onClick={() => handleOpenConfirm(item, AmlStatusEnum.APPROVE)}
              />
              <ActionButton
                icon={<X className="h-4 w-4 text-rose-600" />}
                tooltip="Reject Case"
                onClick={() => handleOpenConfirm(item, AmlStatusEnum.REJECT)}
              />
            </>
          )}
          <ActionButton
            icon={<Eye className="h-4 w-4" />}
            tooltip="View Details"
            onClick={() => {
              setSelectedRecord({ ...item, isJunior: true });
              setIsDetailOpen(true);
            }}
          />
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
            searchPlaceholder="Search by CIF, NID, or Name"
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
              </div>
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

          <JuniorAccountViewModal
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedRecord(null);
            }}
            account={selectedRecord ?? undefined}
          />

          <AmlConfirmDialog
            isOpen={isConfirmDialogOpen}
            onClose={() => setIsConfirmDialogOpen(false)}
            onConfirm={handleConfirmAction}
            status={confirmStatus}
            isLoading={isConfirmLoading}
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
