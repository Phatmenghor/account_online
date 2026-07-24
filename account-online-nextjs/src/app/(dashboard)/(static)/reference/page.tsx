"use client";

import { PageHeader } from '@/components/shared/common/page-header';
import { TableToolbar } from "@/components/shared/common/table-toolbar";

import { useReferenceState } from '@/features/master-data/store/state/reference-state';
import { setPageNo, setSearchFilter, setStatusFilter } from '@/features/master-data/store/slices/reference-slice';
import { fetchAllReferenceService, createReferenceThunk, updateReferenceThunk, deleteReferenceThunk } from '@/features/master-data/store/thunks/reference-thunks';
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
import { Search, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  AllReferenceModel,
  ReferenceModel,
} from "@/features/master-data/types/reference/reference.response";
import Loading from "@/components/shared/common/loading";
import { createReferenceTableColumns } from "@/features/master-data/table/reference-content";
import ReferenceViewModal from "@/features/master-data/components/reference-detail-modal";
import ModalReference from "@/features/master-data/components/reference-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateReferenceReq,
  UpdateReferenceReq,
} from "@/features/master-data/types/reference/reference.request";
import {
  createReferenceService,
  deleteReferenceService,
  getAllReferenceService,
  updateReferenceService,
} from "@/features/master-data/services/reference/reference.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function ReferencePageContent() {
  const dispatch = useAppDispatch();
  const { referenceData: references, isLoading, filters } = useReferenceState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReference, setSelectedReference] =
    useState<ReferenceModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.REFERENCE,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadReferences = useCallback(async () => {
    try {
      dispatch(fetchAllReferenceService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }));
    } catch (error: any) {
      console.error("Failed to fetch references: ", error);
    } finally {
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveReference = async (
    formData: CreateReferenceReq | { id: number; updates: UpdateReferenceReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateReferenceReq;
        await dispatch(createReferenceThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Reference created successfully",
            description: "New Reference",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateReferenceReq };
        if (!updateData.id) {
          console.error("Missing reference id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateReferenceThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Reference updated successfully",
            description: "Updated Reference",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedReference(null);
      loadReferences();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save reference status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReference = async () => {
    if (!selectedReference) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteReferenceThunk(selectedReference.id)).unwrap();
      AppToast({
        type: "success",
        message: "Bank deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedReference(null);
      loadReferences();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete bank",
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

  const handleEditReference = (reference: ReferenceModel) => {
    setSelectedReference(reference);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddReference = () => {
    setSelectedReference(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewReferenceDetail = (reference: ReferenceModel) => {
    setSelectedReference(reference);
    setIsReferenceDetailOpen(true);
  };

  const handleDeleteReference = (reference: ReferenceModel) => {
    setSelectedReference(reference);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Relationship Managers"
        subtitle="Manage RM (Relationship Manager) directories"
        icon={UserCheck}
        count={references?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search references..."
          searchAriaLabel="search-reference"
          disabled={isSubmitting}
          actions={<Button size="sm" onClick={handleAddReference}>New</Button>}
        />

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Table container with proper overflow handling */}
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={references?.content || []}
                columns={createReferenceTableColumns({
                  data: references,
                  handlers: {
                    handleEditReference,
                    handleViewReferenceDetail,
                    handleDeleteReference,
                  },
                })}
                loading={isLoading}
                emptyMessage="No bank found"
                getRowKey={(reference) => reference.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={references?.totalPages || 1}
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
            setSelectedReference(null);
          }}
          onDelete={confirmDeleteReference}
          title="Delete Bank"
          description={`Are you sure you want to delete this bank`}
          itemName={selectedReference?.nameEn || selectedReference?.nameKh}
          isSubmitting={isSubmitting}
        />

        <ReferenceViewModal
          isOpen={isReferenceDetailOpen}
          onClose={() => {
            setIsReferenceDetailOpen(false);
            setSelectedReference(null);
          }}
          reference={selectedReference ?? undefined}
          referenceId={selectedReference?.id ?? 0}
        />

        <ModalReference
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedReference(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveReference}
          referenceId={selectedReference?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
    </div>
  );
}

export default function ReferencePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReferencePageContent />
    </Suspense>
  );
}
