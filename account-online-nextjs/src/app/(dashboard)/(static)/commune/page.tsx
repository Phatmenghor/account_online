"use client";

import { useCommuneState } from '@/features/master-data/store/state/commune-state';
import { setPageNo, setSearchFilter, setStatusFilter } from '@/features/master-data/store/slices/commune-slice';
import { fetchAllCommuneService, createCommuneThunk, updateCommuneThunk, deleteCommuneThunk } from '@/features/master-data/store/thunks/commune-thunks';
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
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import {
  AllCommuneModel,
  CommuneModel,
} from "@/features/master-data/types/commune/commune.response";
import Loading from "@/components/shared/common/loading";
import { createCommuneTableColumns } from "@/features/master-data/table/commune-content";
import CommuneViewModal from "@/features/master-data/components/commune-detail-modal";
import ModalCommune from "@/features/master-data/components/commune-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { CreateCommuneReq, UpdateCommuneReq } from "@/features/master-data/types/commune/commune.request";
import { createCommuneService, deleteCommuneService, getAllCommuneService, updateCommuneService } from "@/features/master-data/services/commune/commune.service";

function CommunePageContent() {
  const dispatch = useAppDispatch();
  const { communeData: communes, isLoading, filters } = useCommuneState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<CommuneModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommuneDetailOpen, setIsCommuneDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.COMMUNE,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadCommunes = useCallback(async () => {
    try {
      dispatch(fetchAllCommuneService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      }));
    } catch (error: any) {
      console.error("Failed to fetch communes: ", error);
    } finally {
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadCommunes();
  }, [loadCommunes, debouncedSearchQuery]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveCommune = async (
    formData: CreateCommuneReq | { id: number; updates: UpdateCommuneReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateCommuneReq;
        await dispatch(createCommuneThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Commune created successfully",
            description: "New Commune",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateCommuneReq };
        if (!updateData.id) {
          console.error("Missing commune id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateCommuneThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Commune updated successfully",
            description: "Updated Commune",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedCommune(null);
      loadCommunes();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save commune status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCommune = async () => {
    if (!selectedCommune) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteCommuneThunk(selectedCommune.id)).unwrap();
      AppToast({
        type: "success",
        message: "Commune deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCommune(null);
      loadCommunes();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete commune",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCommune = (commune: CommuneModel) => {
    setSelectedCommune(commune);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddCommune = () => {
    setSelectedCommune(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewCommuneDetail = (commune: CommuneModel) => {
    setSelectedCommune(commune);
    setIsCommuneDetailOpen(true);
  };

  const handleDeleteCommune = (commune: CommuneModel) => {
    setSelectedCommune(commune);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <div className="flex justify-between items-center gap-4">
          <div />
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-commune"
                autoComplete="search-commune"
                type="search"
                placeholder="Search communes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleAddCommune}>New</Button>
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
                data={communes?.content || []}
                columns={createCommuneTableColumns({
                  data: communes,
                  handlers: {
                    handleEditCommune,
                    handleViewCommuneDetail,
                    handleDeleteCommune,
                  },
                })}
                loading={isLoading}
                emptyMessage="No communes found"
                getRowKey={(commune) => commune.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={communes?.totalPages || 1}
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
            setSelectedCommune(null);
          }}
          onDelete={confirmDeleteCommune}
          title="Delete Commune"
          description={`Are you sure you want to delete this commune`}
          itemName={selectedCommune?.communeEn || selectedCommune?.communeKh}
          isSubmitting={isSubmitting}
        />

        <CommuneViewModal
          isOpen={isCommuneDetailOpen}
          onClose={() => {
            setIsCommuneDetailOpen(false);
            setSelectedCommune(null);
          }}
          commune={selectedCommune ?? undefined}
          communeId={selectedCommune?.id ?? 0}
        />

        <ModalCommune
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedCommune(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveCommune}
          communeId={selectedCommune?.id ?? 0}
          isSubmitting={isSubmitting}
          districts={[]} // TODO: Add districts list from API
        />
      </CardContent>
    </Card>
  );
}

export default function CommunePage() {
  return (
    <Suspense fallback={<Loading />}>
      <CommunePageContent />
    </Suspense>
  );
}