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
import { History as HistoryIcon, Eye } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { AppToast } from "@/components/shared/toast/app-toast";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import JuniorAccountViewModal from "@/features/account-opening/components/junior-account-detail-modal";
import { ActionButton } from "@/components/shared/button/custom-button";
import { getAllJuniorAmlHistoryService } from "@/features/aml/services/junior-aml-history.service";

function JuniorAmlHistoryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.JUNIOR_AML_HISTORY,
  });

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const resData = await getAllJuniorAmlHistoryService({
        search: debouncedSearch,
        pageNo: currentPage,
        pageSize: 15,
      });
      const content = resData?.content || [];
      setData(content);
      setTotalElements(resData?.totalElements || content.length);
      setTotalPages(resData?.totalPages || 1);
    } catch {
      AppToast({ type: "error", message: "Failed to fetch Junior AML History" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
      label: "Child Name",
      minWidth: "160px",
      render: (item) => <span className="text-xs font-semibold">{item.legalHolderName || "---"}</span>,
    },
    {
      key: "status",
      label: "Action Taken",
      minWidth: "120px",
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
      key: "approvedBy",
      label: "Action By",
      minWidth: "140px",
      render: (item) => (
        <span className="text-xs font-medium">
          {item.approvedBy || item.rejectedBy || item.actionBy || "System"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Timestamp",
      minWidth: "160px",
      render: (item) => (
        <span className="text-xs font-medium whitespace-nowrap">
          {DateTimeFormat(item.updatedAt || item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "80px",
      render: (item) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="h-4 w-4" />}
            tooltip="View Audit Details"
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
        title="Junior AML Audit History"
        subtitle="Audit log of all reviewed and processed CPBank Junior AML cases"
        icon={HistoryIcon}
        count={totalElements}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            searchPlaceholder="Search by CIF, NID, or Name"
            searchAriaLabel="search-junior-aml-history"
            disabled={isLoading}
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
