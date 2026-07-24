"use client";

import { PageHeader } from '@/components/shared/common/page-header';
import { TableToolbar } from "@/components/shared/common/table-toolbar";

import { useOccupationState } from '@/features/master-data/store/state/occupation-state';
import { setPageNo, setSearchFilter, setStatusFilter } from '@/features/master-data/store/slices/occupation-slice';
import { fetchAllOccupationService, createOccupationThunk, updateOccupationThunk, deleteOccupationThunk } from '@/features/master-data/store/thunks/occupation-thunks';
import { useAppDispatch } from '@/store/store';


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
import { Search, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  AllOccupationModel,
  OccupationModel,
} from "@/features/master-data/types/occupation/occupation.response";
import Loading from "@/components/shared/common/loading";
import { createOccupationTableColumns } from "@/features/master-data/table/occupation-content";
import OccupationViewModal from "@/features/master-data/components/occupation-detail-modal";
import ModalOccupation from "@/features/master-data/components/occupation-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateOccupationReq,
  UpdateOccupationReq,
} from "@/features/master-data/types/occupation/occupation.request";
import {
  createOccupationService,
  deleteOccupationService,
  getAllOccupationService,
  updateOccupationService,
} from "@/features/master-data/services/occupation/occupation.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function OccupationPageContent() {
  const dispatch = useAppDispatch();
  const { occupationData: occupations, isLoading, filters } = useOccupationState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    try {
      dispatch(fetchAllOccupationService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }));
    } catch (error: any) {
      console.error("Failed to fetch occupations: ", error);
    } finally {
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadOccupations();
  }, [loadOccupations, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveOccupation = async (
    formData: CreateOccupationReq | { id: number; updates: UpdateOccupationReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateOccupationReq;
        await dispatch(createOccupationThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Occupation created successfully",
            description: "New Occupation",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateOccupationReq };
        if (!updateData.id) {
          console.error("Missing occupation id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateOccupationThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
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
        message: "Failed to save occupation status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteOccupation = async () => {
    if (!selectedOccupation) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteOccupationThunk(selectedOccupation.id)).unwrap();
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
    dispatch(setStatusFilter(status));
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
    <div className="space-y-4">
      <PageHeader
        title="Occupations"
        subtitle="Manage occupation and employment categories"
        icon={Briefcase}
        count={occupations?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search occupations..."
          searchAriaLabel="search-occupation"
          disabled={isSubmitting}
          actions={<Button size="sm" onClick={handleAddOccupation}>New</Button>}
        />

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
    </div>
  );
}

export default function OccupationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OccupationPageContent />
    </Suspense>
  );
}
