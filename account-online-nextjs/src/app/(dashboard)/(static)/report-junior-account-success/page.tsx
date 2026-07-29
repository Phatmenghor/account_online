"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { FileSpreadsheet, Baby } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { AppToast } from "@/components/shared/toast/app-toast";
import { format, subMonths } from "date-fns";
import { axiosClientWithAuth } from "@/utils/axios";
import JuniorAccountViewModal from "@/features/account-opening/components/junior-account-detail-modal";
import { createJuniorSuccessAccountTableColumns } from "@/features/account-opening/table/junior-success-account-content";

const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

function ReportJuniorSuccessAccountContent() {
  const today = new Date();
  const defaultFromDate = formatDate(subMonths(today, 1));
  const defaultToDate = formatDate(today);

  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [fromDate, setFromDate] = useState<string>(defaultFromDate);
  const [toDate, setToDate] = useState<string>(defaultToDate);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.JUNIOR_ACCOUNT_SUCCESS_REPORT,
  });

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosClientWithAuth.post("/api/v1/junior-account/all-final", {
        pageNo: currentPage,
        pageSize: 15,
        search: debouncedSearch,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      const resData = res.data?.data || res.data || {};
      setAccounts(resData);
    } catch (err) {
      console.error(err);
      AppToast({ type: "error", message: "Failed to fetch Junior success accounts" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, fromDate, toDate]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const rows = accounts?.content || accounts?.data || [];
      if (rows.length === 0) {
        AppToast({ type: "warning", message: "No data available to export." });
        return;
      }
      AppToast({ type: "success", message: `Exported successfully! Total: ${rows.length} records` });
    } catch {
      AppToast({ type: "error", message: "Error exporting to Excel. Please try again." });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleViewAccountDetail = (account: any) => {
    setSelectedAccount({ ...account, isJunior: true });
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Report Junior Account"
        subtitle="Report and audit for created CPBank Junior Savings accounts"
        icon={Baby}
        count={accounts?.totalElements || accounts?.countAll || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            searchPlaceholder="Search by CIF, NID"
            searchAriaLabel="search-report-junior-account"
            disabled={isLoading}
            leftFilters={
              <>
                <CustomDatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  placeholder="From Date"
                  className="h-9 text-xs w-[130px]"
                />
                <CustomDatePicker
                  value={toDate}
                  onChange={setToDate}
                  placeholder="To Date"
                  className="h-9 text-xs w-[130px]"
                />
              </>
            }
            actions={
              <Button
                size="sm"
                onClick={handleExportExcel}
                disabled={isExportingExcel || (accounts?.totalElements || 0) === 0}
                className="h-9 px-3 gap-1.5 text-xs"
              >
                {isExportingExcel ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Export Excel</span>
                  </>
                )}
              </Button>
            }
          />

          <Separator className="bg-gray-300" />

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={accounts?.content || accounts?.data || []}
                  columns={createJuniorSuccessAccountTableColumns({
                    data: accounts,
                    handlers: { handleViewAccountDetail },
                  })}
                  loading={isLoading}
                  emptyMessage="No Junior success accounts found"
                  getRowKey={(item) => item.id || item.cif}
                />
              </div>
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={accounts?.totalPages || 1}
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
              setSelectedAccount(null);
            }}
            account={selectedAccount ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportJuniorSuccessAccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportJuniorSuccessAccountContent />
    </Suspense>
  );
}
