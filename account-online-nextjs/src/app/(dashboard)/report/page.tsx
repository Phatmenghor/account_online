"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-select";
import { toast } from "sonner";

import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { DataTable } from "@/components/shared/table/data-table";
import { Report } from "@/components/shared/table/report-content";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";

import { STATUS_REPORT_OPTIONS } from "@/constants/AppResource/filter/status";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";

import Loading from "@/components/shared/common/loading";
import { AllReportModel, ReportModel } from "@/models/report/report.response";
import { AllReportRequestModel } from "@/models/report/report.request";
import {
  getAccountOnlineReportAllDataService,
  getAccountOnlineReportAllViewService,
} from "@/services/report/acc-online-report.service";
import { exportReportToExcel } from "@/utils/export-file/exportReportExcel";
import z from "zod";

// Form data type
export type ReportData = {
  fromDate: string;
  toDate: string;
  status: string;
};

// Zod schema for validation
export const ReportSchema = z.object({
  fromDate: z.string().min(1, "From Date is required"),
  toDate: z.string().min(1, "To Date is required"),
  status: z.string().optional(),
});

const defaultForm: ReportData = { fromDate: "", toDate: "", status: "" };

const STATUS_COLOR_MAP: Record<string, string> = {
  Pending: "bg-yellow-500",
  Approved: "bg-green-500",
  Rejected: "bg-red-500",
  InProgress: "bg-blue-500",
  // add more statuses as needed
};

function ReportPageContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState(defaultForm);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [report, setReport] = useState<AllReportModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.REPORT,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) updateUrlWithPage(1, true);
  }, [searchParams, updateUrlWithPage]);

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const errors: Record<string, string> = {};
    Object.entries(formData).forEach(([field, value]) => {
      try {
        ReportSchema.shape[field as keyof ReportData].parse(value);
      } catch (e: any) {
        if (e.issues?.[0]) errors[field] = e.issues[0].message;
      }
    });
    setValidationErrors(errors);
    if (!Object.keys(errors).length) loadReport();
  };

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const req: AllReportRequestModel = {
        pageNo: Number(currentPage),
        pageSize: 15,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        status: statusFilter.length ? statusFilter : [],
      };
      const res = await getAccountOnlineReportAllDataService(req);
      setReport(res);
    } catch (err: any) {
      toast.error(err.errorMessage || "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, formData.fromDate, formData.toDate]);

  useEffect(() => {
    // Only trigger search if both dates are filled
    if (formData.fromDate && formData.toDate) {
      loadReport();
    }
  }, [
    formData.fromDate,
    formData.toDate,
    statusFilter,
    currentPage,
    loadReport,
  ]);

  const handleExportExcel = async () => {
    setIsExportLoading(true);
    try {
      const req: AllReportRequestModel = {
        pageNo: 1,
        pageSize: 100000,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        status: statusFilter.length ? statusFilter : [],
      };
      const res = await getAccountOnlineReportAllViewService(req);
      if (!res?.length) {
        toast.error("No data to export.");
        return;
      }
      await exportReportToExcel(res, "AccountReport.xlsx");
      toast.success("Excel export ready.");
    } catch (err: any) {
      toast.error(err.errorMessage || "Failed to export Excel.");
    } finally {
      setIsExportLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white shadow-lg rounded-xl">
      <CardContent className="flex flex-col space-y-2 p-6 h-full">
        {/* FILTER SECTION */}
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* From Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                From Date
              </label>
              <CustomDatePicker
                className="h-10 w-full border rounded-md px-2"
                value={formData.fromDate}
                placeholder="Select start date"
                onChange={(v) => handleInputChange("fromDate", v)}
              />
              {validationErrors.fromDate && (
                <span className="text-xs text-red-500">
                  {validationErrors.fromDate}
                </span>
              )}
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                To Date
              </label>
              <CustomDatePicker
                className="h-10 w-full border rounded-md px-2"
                value={formData.toDate}
                placeholder="Select end date"
                onChange={(v) => handleInputChange("toDate", v)}
              />
              {validationErrors.toDate && (
                <span className="text-xs text-red-500">
                  {validationErrors.toDate}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium ">Status</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="h-10 min-w-[120px] max-w-full px-3 border rounded-md flex flex-wrap gap-1">
                    {statusFilter.length === 0 ? (
                      <span className="truncate">All Status</span>
                    ) : (
                      statusFilter.map((s) => (
                        <span
                          key={s}
                          className={cn(
                            "text-white text-xs px-2 py-1 rounded",
                            STATUS_COLOR_MAP[s]
                          )}
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[300px] p-0">
                  <Command>
                    <CommandGroup>
                      {STATUS_REPORT_OPTIONS.map((item) => {
                        const selected = statusFilter.includes(item.value);
                        return (
                          <CommandItem
                            key={item.value}
                            onSelect={() =>
                              setStatusFilter((prev) =>
                                selected
                                  ? prev.filter((s) => s !== item.value)
                                  : [...prev, item.value]
                              )
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              className="flex items-center gap-2"
              onClick={handleExportExcel}
              variant="secondary"
              disabled={isExportLoading} // optional: disable button while loading
            >
              {isExportLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Exporting...
                </span>
              ) : (
                <>
                  <Download size={16} /> Export
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator className="my-2" />

        {/* TABLE SECTION */}
        <div className="flex-1 overflow-x-auto bg-gray-50 rounded-lg p-2">
          <DataTable
            loading={isLoading}
            data={report?.content || []}
            emptyMessage="No report found"
            getRowKey={(row) => row.id}
            columns={Report(
              report ?? {
                content: [],
                pageNo: 1,
                pageSize: 15,
                totalElements: 0,
                totalPages: 1,
              }
            )}
          />
        </div>

        {/* PAGINATION */}
        <div className="flex justify-end mt-2">
          <CustomPagination
            size="md"
            currentPage={currentPage}
            totalPages={report?.totalPages || 1}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportPageContent />
    </Suspense>
  );
}
