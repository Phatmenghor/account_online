"use client";

import { PageHeader } from '@/components/shared/common/page-header';
import { TableToolbar } from "@/components/shared/common/table-toolbar";

import { useLegalTypeState } from '@/features/master-data/store/state/legaltype-state';
import { setPageNo, setSearchFilter, setStatusFilter } from '@/features/master-data/store/slices/legaltype-slice';
import { fetchAllLegalTypeService, createLegalTypeThunk, updateLegalTypeThunk, deleteLegalTypeThunk } from '@/features/master-data/store/thunks/legaltype-thunks';
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
import { Search, IdCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  AllLegalTypeModel,
  LegalTypeModel,
} from "@/features/master-data/types/legal-type/legal-type.response";
import Loading from "@/components/shared/common/loading";
import { createLegalTypeTableColumns } from "@/features/master-data/table/legal-type-content";
import LegalTypeViewModal from "@/features/master-data/components/legal-type-detail-modal";
import ModalLegalType from "@/features/master-data/components/legal-type-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  AllLegalTypeReq,
  CreateLegalTypeReq,
  UpdateLegalTypeReq,
} from "@/features/master-data/types/legal-type/legal-type.request";
import {
  createLegalTypeService,
  deleteLegalTypeService,
  getAllLegalTypeService,
  updateLegalTypeService,
} from "@/features/master-data/services/legal-type/legal-type.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function LegalTypePageContent() {
  const dispatch = useAppDispatch();
  const { legalTypeData: legalTypes, isLoading, filters } = useLegalTypeState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLegalType, setSelectedLegalType] =
    useState<LegalTypeModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLegalTypeDetailOpen, setIsLegalTypeDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.LEGAL_TYPE,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadLegalTypes = useCallback(async () => {
    try {
      dispatch(fetchAllLegalTypeService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }));
    } catch (error: any) {
      console.error("Failed to fetch legal types: ", error);
    } finally {
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadLegalTypes();
  }, [loadLegalTypes, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveLegalType = async (
    formData: CreateLegalTypeReq | { id: number; updates: UpdateLegalTypeReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateLegalTypeReq;
        await dispatch(createLegalTypeThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "LegalType created successfully",
            description: "New LegalType",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateLegalTypeReq };
        if (!updateData.id) {
          console.error("Missing legalType id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateLegalTypeThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "LegalType updated successfully",
            description: "Updated LegalType",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedLegalType(null);
      loadLegalTypes();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save legalType status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteLegalType = async () => {
    if (!selectedLegalType) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteLegalTypeThunk(selectedLegalType.id)).unwrap();
      AppToast({
        type: "success",
        message: "Legal Type deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedLegalType(null);
      loadLegalTypes();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete legal type",
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

  const handleEditLegalType = (legalType: LegalTypeModel) => {
    setSelectedLegalType(legalType);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddLegalType = () => {
    setSelectedLegalType(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewLegalTypeDetail = (legalType: LegalTypeModel) => {
    setSelectedLegalType(legalType);
    setIsLegalTypeDetailOpen(true);
  };

  const handleDeleteLegalType = (legalType: LegalTypeModel) => {
    setSelectedLegalType(legalType);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Legal Types"
        subtitle="Manage identification card legal types"
        icon={IdCard}
        count={legalTypes?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search legal type..."
            searchAriaLabel="search-legaltype"
            disabled={isSubmitting}
            actions={<Button size="sm" onClick={handleAddLegalType}>New</Button>}
          />

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Table container with proper overflow handling */}
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={legalTypes?.content || []}
                columns={createLegalTypeTableColumns({
                  data: legalTypes,
                  handlers: {
                    handleEditLegalType,
                    handleViewLegalTypeDetail,
                    handleDeleteLegalType,
                  },
                })}
                loading={isLoading}
                emptyMessage="No legal type found"
                getRowKey={(legalType) => legalType.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={legalTypes?.totalPages || 1}
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
            setSelectedLegalType(null);
          }}
          onDelete={confirmDeleteLegalType}
          title="Delete Legal Type"
          description={`Are you sure you want to delete this legal type`}
          itemName={
            selectedLegalType?.nameEn ||
            selectedLegalType?.nameKh ||
            selectedLegalType?.legalTypeValue
          }
          isSubmitting={isSubmitting}
        />

        <LegalTypeViewModal
          isOpen={isLegalTypeDetailOpen}
          onClose={() => {
            setIsLegalTypeDetailOpen(false);
            setSelectedLegalType(null);
          }}
          legalType={selectedLegalType ?? undefined}
          legalTypeId={selectedLegalType?.id ?? 0}
        />

        <ModalLegalType
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedLegalType(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveLegalType}
          legalTypeId={selectedLegalType?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
    </div>
  );
}

export default function LegalTypePage() {
  return (
    <Suspense fallback={<Loading />}>
      <LegalTypePageContent />
    </Suspense>
  );
}
