"use client";

import { Suspense } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AllMaritalModel,
  MaritalModel,
} from "@/models/static/marital/marital.response";
import Loading from "@/components/shared/common/loading";
import { createMaritalTableColumns } from "@/components/shared/table/marital-content";
import MaritalViewModal from "@/components/shared/modal/marital-detail-modal";
import ModalMarital from "@/components/shared/modal/marital-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { CreateMaritalReq, UpdateMaritalReq } from "@/models/static/marital/marital.request";
import { createMaritalService, deleteMaritalService, getAllMaritalService, updateMaritalService } from "@/services/dashboard/marital/marital.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function MaritalPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [maritals, setMaritals] = useState<AllMaritalModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMarital, setSelectedMarital] = useState<MaritalModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaritalDetailOpen, setIsMaritalDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.MARITAL,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadMaritals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllMaritalService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setMaritals(response);
    } catch (error: any) {
      console.error("Failed to fetch maritals: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadMaritals();
  }, [loadMaritals, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveMarital = async (
    formData: CreateMaritalReq | { id: number; updates: UpdateMaritalReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateMaritalReq;

        const response = await createMaritalService({
          nameEn: createData.nameEn,
          nameKh: createData.nameKh,
          status: createData.status,
        });

        // Optimistic update
        setMaritals((prev: any) =>
          prev
            ? {
                ...prev,
                content: [response, ...prev.content],
                totalElements: prev.totalElements + 1,
              }
            : {
                content: [response],
                pageNo: 1,
                pageSize: 10,
                totalElements: 1,
                totalPages: 1,
                last: true,
              }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Marital status created successfully",
            description: "New Marital Status",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateMaritalReq };

        if (!updateData.id) {
          console.error("Missing marital id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateMaritalService(
          updateData.id,
          updateData.updates
        );

        setMaritals((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((marital) =>
                  marital.id === updateData.id ? response : marital
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Marital status updated successfully",
            description: "Updated Marital Status",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedMarital(null);
      loadMaritals();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save marital status");
      AppToast({
        type: "error",
        message: "Failed to save marital status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteMarital = async () => {
    if (!selectedMarital) return;
    setIsSubmitting(true);
    try {
      await deleteMaritalService(selectedMarital.id);
      AppToast({
        type: "success",
        message: "Marital status deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedMarital(null);
      loadMaritals();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete marital status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    // Reset to first page when filter changes
    updateUrlWithPage(1, true);
  };

  const handleEditMarital = (marital: MaritalModel) => {
    setSelectedMarital(marital);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddMarital = () => {
    setSelectedMarital(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewMaritalDetail = (marital: MaritalModel) => {
    setSelectedMarital(marital);
    setIsMaritalDetailOpen(true);
  };

  const handleDeleteMarital = (marital: MaritalModel) => {
    setSelectedMarital(marital);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-marital"
                autoComplete="search-marital"
                type="search"
                placeholder="Search maritals..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_USER_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={handleAddMarital}>New</Button>
          </div>
        </div>

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Table container with proper overflow handling */}
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={maritals?.content || []}
                columns={createMaritalTableColumns({
                  data: maritals,
                  handlers: {
                    handleEditMarital,
                    handleViewMaritalDetail,
                    handleDeleteMarital,
                  },
                })}
                loading={isLoading}
                emptyMessage="No marital status found"
                getRowKey={(marital) => marital.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={maritals?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedMarital(null);
          }}
          onDelete={confirmDeleteMarital}
          title="Delete Marital Status"
          description={`Are you sure you want to delete this marital status`}
          itemName={selectedMarital?.nameEn || selectedMarital?.nameKh}
          isSubmitting={isSubmitting}
        />

        <MaritalViewModal
          isOpen={isMaritalDetailOpen}
          onClose={() => {
            setIsMaritalDetailOpen(false);
            setSelectedMarital(null);
          }}
          marital={selectedMarital ?? undefined}
          maritalId={selectedMarital?.id ?? 0}
        />

        <ModalMarital
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedMarital(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveMarital}
          maritalId={selectedMarital?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function MaritalPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MaritalPageContent />
    </Suspense>
  );
}