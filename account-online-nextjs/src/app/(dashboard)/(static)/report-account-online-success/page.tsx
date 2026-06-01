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
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import { createSuccessAccountTableColumns } from "@/components/shared/table/success-account-content";
import {
    AllSuccessAccountOnlineModel,
    AllSuccessAccountOnlineExcelModel,
    SuccessAccountOnlineModel,
    SuccessAccountOnlineExcelModel,
} from "@/models/open-acc-success/success-account-response.model";
import {
    getSuccessAccountOnlineService,
    getSuccessAccountOnlineExcelService,
} from "@/services/get-account/acc-online-success.service";
import SuccessAccountViewModal from "@/components/shared/modal/success-account-detail-modal";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { AppToast } from "@/components/shared/toast/app-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format, subMonths } from "date-fns";

const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const IMAGE_BASE_URL = "http://192.168.101.5:7070/api/customer-images";

const EXCEL_HEADERS = ["#", "Legal ID", "CIF", "KHR Account", "USD Account", "Mnemonic", "Branch NameKh", "NID Image", "Selfie Image", "Created At"];
const COLUMN_WIDTHS = [5, 18, 18, 22, 22, 18, 30, 20, 20, 20];

const fetchImageAsBase64 = async (imageUrl: string): Promise<{ base64: string; extension: string } | null> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) return null;
        const blob = await response.blob();
        const extension = imageUrl.split(".").pop()?.toLowerCase() || "jpg";
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve({ base64, extension });
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

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

    const searchParams = useSearchParams();
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
        baseRoute: ROUTES.DASHBOARD.STATIC.ACCOUNT_ONLINE_SUCCESS_REPORT,
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
            const response = await getSuccessAccountOnlineService({
                search: debouncedSearchQuery,
                pageNo: currentPage,
                pageSize: 15,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });
            setAccounts(response);
        } catch (error: any) {
            console.error("Failed to fetch success accounts:", error);
            AppToast({ type: "error", message: "Failed to fetch success accounts" });
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchQuery, currentPage, fromDate, toDate]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleResetFilter = () => {
        setFromDate(defaultFromDate);
        setToDate(defaultToDate);
    };

    const handleViewAccountDetail = (account: SuccessAccountOnlineModel) => {
        setSelectedAccount(account);
        setIsDetailOpen(true);
    };

    const exportToExcel = async (): Promise<void> => {
        setIsExportingExcel(true);
        try {
            const allData: AllSuccessAccountOnlineExcelModel = await getSuccessAccountOnlineExcelService({
                search: debouncedSearchQuery,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            const rows: SuccessAccountOnlineExcelModel[] = allData?.content || [];

            if (rows.length === 0) {
                AppToast({ type: "warning", message: "No data available to export." });
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Success Accounts");

            worksheet.mergeCells(1, 1, 1, EXCEL_HEADERS.length);
            const titleCell = worksheet.getCell("A1");
            titleCell.value = "Success Account Online Report";
            titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
            titleCell.alignment = { vertical: "middle", horizontal: "center" };
            titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };

            worksheet.mergeCells(2, 1, 2, EXCEL_HEADERS.length);
            const summaryCell = worksheet.getCell("A2");
            summaryCell.value = `Total Records: ${allData?.countAll ?? rows.length}  |  From: ${fromDate}  To: ${toDate}`;
            summaryCell.font = { size: 11, bold: true };
            summaryCell.alignment = { vertical: "middle", horizontal: "center" };
            summaryCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };

            const headerRow = worksheet.getRow(4);
            EXCEL_HEADERS.forEach((text, idx) => {
                const cell = headerRow.getCell(idx + 1);
                cell.value = text;
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007ACC" } };
                cell.border = {
                    top: { style: "thin" }, bottom: { style: "thin" },
                    left: { style: "thin" }, right: { style: "thin" },
                };
                worksheet.getColumn(idx + 1).width = COLUMN_WIDTHS[idx];
            });

            const IMAGE_ROW_HEIGHT = 90;

            for (let i = 0; i < rows.length; i++) {
                const item = rows[i];
                const excelRowNumber = i + 5;

                const row = worksheet.addRow([
                    i + 1,
                    item.legalId || "---",
                    item.cif || "---",
                    item.khrAccount || "---",
                    item.usdAccount || "---",
                    item.mnemonic || "---",
                    item.branchNameKh || "---",
                    "",
                    "",
                    item.createdAt || "---",
                ]);

                row.height = IMAGE_ROW_HEIGHT;

                row.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern", pattern: "solid",
                        fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
                    };
                    cell.border = {
                        top: { style: "thin" }, bottom: { style: "thin" },
                        left: { style: "thin" }, right: { style: "thin" },
                    };
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                });

                if (item.nidImageName) {
                    const nidImg = await fetchImageAsBase64(`${IMAGE_BASE_URL}/${item.nidImageName}`);
                    if (nidImg) {
                        const imageId = workbook.addImage({ base64: nidImg.base64, extension: nidImg.extension as "jpeg" | "png" | "gif" });
                        worksheet.addImage(imageId, { tl: { col: 7, row: excelRowNumber - 1 } as any, ext: { width: 120, height: 80 }, editAs: "oneCell" } as any);
                    } else {
                        worksheet.getCell(excelRowNumber, 8).value = "Image N/A";
                    }
                }

                if (item.selfieImageName) {
                    const selfieImg = await fetchImageAsBase64(`${IMAGE_BASE_URL}/${item.selfieImageName}`);
                    if (selfieImg) {
                        const imageId = workbook.addImage({ base64: selfieImg.base64, extension: selfieImg.extension as "jpeg" | "png" | "gif" });
                        worksheet.addImage(imageId, { tl: { col: 8, row: excelRowNumber - 1 } as any, ext: { width: 120, height: 80 }, editAs: "oneCell" } as any);
                    } else {
                        worksheet.getCell(excelRowNumber, 9).value = "Image N/A";
                    }
                }
            }

            [10].forEach((colIdx) => {
                worksheet.getColumn(colIdx).eachCell((cell, rowNumber) => {
                    if (rowNumber > 4 && cell.value && cell.value !== "---") {
                        try {
                            const d = new Date(cell.value as string);
                            if (!isNaN(d.getTime())) {
                                cell.value = d;
                                cell.numFmt = "dd-mm-yyyy hh:mm";
                            }
                        } catch { /* keep as string */ }
                    }
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `success_accounts_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
            AppToast({ type: "success", message: `Excel exported successfully! Total records: ${rows.length}` });
        } catch (error) {
            console.error("Error exporting to Excel:", error);
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
                            onChange={handleSearchChange}
                            className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <CustomDatePicker
                            value={fromDate}
                            onChange={(date) => setFromDate(date)}
                            placeholder="From Date"
                            className="h-9 text-xs w-[130px]"
                        />
                        <CustomDatePicker
                            value={toDate}
                            onChange={(date) => setToDate(date)}
                            placeholder="To Date"
                            className="h-9 text-xs w-[130px]"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilter}
                            className="h-9 px-2 gap-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </Button>
                        <Button
                            onClick={exportToExcel}
                            disabled={isExportingExcel || (accounts?.totalElements ?? 0) === 0}
                            size="sm"
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
                                    handlers: { handleViewAccountDetail },
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
                    onClose={() => {
                        setIsDetailOpen(false);
                        setSelectedAccount(null);
                    }}
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
