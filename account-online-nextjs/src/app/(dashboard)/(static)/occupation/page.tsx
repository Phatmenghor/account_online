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
import {
  AllOccupationModel,
  OccupationModel,
} from "@/models/static/occupation/occupation.response";
import Loading from "@/components/shared/common/loading";
import { createOccupationTableColumns } from "@/components/shared/table/occupation-content";
import OccupationViewModal from "@/components/shared/modal/occupation-detail-modal";
import ModalOccupation from "@/components/shared/modal/occupation-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateOccupationReq,
  UpdateOccupationReq,
} from "@/models/static/occupation/occupation.request";
import {
  createOccupationService,
  deleteOccupationService,
  getAllOccupationService,
  updateOccupationService,
} from "@/services/dashboard/occupation/occupation.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function OccupationPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [occupations, setOccupations] = useState<AllOccupationModel | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOccupation, setSelectedOccupation] =
    useState<OccupationModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOccupationDetailOpen, setIsOccupationDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.OCCUPATION,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadOccupations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllOccupationService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setOccupations(response);
    } catch (error: any) {
      console.error("Failed to fetch occupations: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadOccupations();
  }, [loadOccupations, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveOccupation = async (
    formData:
      | CreateOccupationReq
      | { id: number; updates: UpdateOccupationReq },
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateOccupationReq;

        const response = await createOccupationService({
          nameEn: createData.nameEn,
          nameKh: createData.nameKh,
          occupationCode: createData.occupationCode,
          status: createData.status,
        });

        // Optimistic update
        setOccupations((prev: any) =>
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
              },
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Occupation created successfully",
            description: "New Occupation",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as {
          id: number;
          updates: UpdateOccupationReq;
        };

        if (!updateData.id) {
          console.error("Missing occupation id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateOccupationService(
          updateData.id,
          updateData.updates,
        );

        setOccupations((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((occupation) =>
                  occupation.id === updateData.id ? response : occupation,
                ),
              }
            : prev,
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Occupation updated successfully",
            description: "Updated Occupation",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedOccupation(null);
      loadOccupations();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save occupation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteOccupation = async () => {
    if (!selectedOccupation) return;
    setIsSubmitting(true);
    try {
      await deleteOccupationService(selectedOccupation.id);
      AppToast({
        type: "success",
        message: "Occupation deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedOccupation(null);
      loadOccupations();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete occupation",
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

  const handleEditOccupation = (occupation: OccupationModel) => {
    setSelectedOccupation(occupation);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddOccupation = () => {
    setSelectedOccupation(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewOccupationDetail = (occupation: OccupationModel) => {
    setSelectedOccupation(occupation);
    setIsOccupationDetailOpen(true);
  };

  const handleDeleteOccupation = (occupation: OccupationModel) => {
    setSelectedOccupation(occupation);
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
                aria-label="search-occupation"
                autoComplete="search-occupation"
                type="search"
                placeholder="Search occupations..."
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
            <Button onClick={handleAddOccupation}>New</Button>
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
                data={occupations?.content || []}
                columns={createOccupationTableColumns({
                  data: occupations,
                  handlers: {
                    handleEditOccupation,
                    handleViewOccupationDetail,
                    handleDeleteOccupation,
                  },
                })}
                loading={isLoading}
                emptyMessage="No occupation found"
                getRowKey={(occupation) => occupation.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={occupations?.totalPages || 1}
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
            setSelectedOccupation(null);
          }}
          onDelete={confirmDeleteOccupation}
          title="Delete Occupation"
          description={`Are you sure you want to delete this occupation`}
          itemName={
            selectedOccupation?.nameEn ||
            selectedOccupation?.nameKh ||
            selectedOccupation?.occupationCode
          }
          isSubmitting={isSubmitting}
        />

        <OccupationViewModal
          isOpen={isOccupationDetailOpen}
          onClose={() => {
            setIsOccupationDetailOpen(false);
            setSelectedOccupation(null);
          }}
          occupation={selectedOccupation ?? undefined}
          occupationId={selectedOccupation?.id ?? 0}
        />

        <ModalOccupation
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedOccupation(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveOccupation}
          occupationId={selectedOccupation?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function OccupationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OccupationPageContent />
    </Suspense>
  );
}
