"use client";

import { Suspense } from "react";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search, FileSpreadsheet, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import { createSuccessAccountTableColumns } from "@/components/shared/table/success-account-content";
import {
    AllSuccessAccountOnlineModel,
    SuccessAccountOnlineModel,
} from "@/models/open-acc-success/success-account-response.model";
import {
    getSuccessAccountOnlineService,
    getSuccessAccountOnlineExcelService,
} from "@/services/get-account/acc-online-success.service";
import SuccessAccountViewModal from "@/components/shared/modal/success-account-detail-modal";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { AppToast } from "@/components/shared/toast/app-toast";
import { exportSuccessAccountToExcel } from "@/utils/export-file/export-success-account-excel";
import { format, subMonths } from "date-fns";

const formatDate = (date: Date) =>
    format(date, "yyyy-MM-dd");

function ReportSuccessAccountPageContent() {
    const today = new Date();
    const defaultFromDate = formatDate(subMonths(today, 1));
    const defaultToDate = formatDate(today);

    const [searchQuery, setSearchQuery] = useState("");
    const [accounts, setAccounts] = useState<AllSuccessAccountOnlineModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<SuccessAccountOnlineModel | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [fromDate, setFromDate] = useState<string>(defaultFromDate);
    const [toDate, setToDate] = useState<string>(defaultToDate);

    const debouncedSearch = useDebounce(searchQuery, 400);

    const { currentPage, handlePageChange } = usePagination({
        baseRoute: ROUTES.DASHBOARD.STATIC.ACCOUNT_ONLINE_SUCCESS_REPORT,
    });

    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getSuccessAccountOnlineService({
                search: debouncedSearch,
                pageNo: currentPage,
                pageSize: 15,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });
            setAccounts(response);
        } catch {
            AppToast({ type: "error", message: "Failed to fetch success accounts" });
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
            const allData = await getSuccessAccountOnlineExcelService({
                search: debouncedSearch,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            const rows = allData?.content ?? [];
            if (rows.length === 0) {
                AppToast({ type: "warning", message: "No data available to export." });
                return;
            }

            await exportSuccessAccountToExcel({
                rows,
                totalRecords: allData?.countAll ?? rows.length,
                fromDate,
                toDate,
            });

            AppToast({ type: "success", message: `Exported successfully! Total: ${rows.length} records` });
        } catch {
            AppToast({ type: "error", message: "Error exporting to Excel. Please try again." });
        } finally {
            setIsExportingExcel(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-6 p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:w-[350px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            aria-label="search-report-account"
                            type="search"
                            placeholder="Search by Legal ID or CIF"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setFromDate(defaultFromDate); setToDate(defaultToDate); }}
                            className="h-9 px-2 gap-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleExportExcel}
                            disabled={isExportingExcel || (accounts?.totalElements ?? 0) === 0}
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
                    </div>
                </div>

                <Separator className="bg-gray-300" />

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-x-auto">
                            <DataTable
                                data={accounts?.content || []}
                                columns={createSuccessAccountTableColumns({
                                    data: accounts,
                                    handlers: { handleViewAccountDetail: (a) => { setSelectedAccount(a); setIsDetailOpen(true); } },
                                })}
                                loading={isLoading}
                                emptyMessage="No success accounts found"
                                getRowKey={(account) => account.id}
                            />
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
                </div>

                <SuccessAccountViewModal
                    isOpen={isDetailOpen}
                    onClose={() => { setIsDetailOpen(false); setSelectedAccount(null); }}
                    account={selectedAccount ?? undefined}
                />
            </CardContent>
        </Card>
    );
}

export default function ReportSuccessAccountPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ReportSuccessAccountPageContent />
        </Suspense>
    );
}
