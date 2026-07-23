"use client";

import { PageHeader } from "@/components/shared/common/page-header";
import { useCommuneState } from "@/features/master-data/store/state/commune-state";
import { setSearchFilter } from "@/features/master-data/store/slices/commune-slice";
import { createCommuneThunk, updateCommuneThunk, deleteCommuneThunk } from "@/features/master-data/store/thunks/commune-thunks";
import { useAppDispatch } from "@/store/store";

import { Suspense, startTransition, useCallback, useEffect, useState } from "react";
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
import { Search, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { createCommuneTableColumns } from "@/features/master-data/table/commune-content";
import {
  AllCommuneModel,
  CommuneModel,
} from "@/features/master-data/types/commune/commune.response";
import {
  CreateCommuneReq,
  UpdateCommuneReq,
} from "@/features/master-data/types/commune/commune.request";
import {
  getAllCommuneService,
} from "@/features/master-data/services/commune/commune.service";
import CommuneViewModal from "@/features/master-data/components/commune-detail-modal";
import ModalCommune from "@/features/master-data/components/commune-modal";

function CommunePageContent() {
  const dispatch = useAppDispatch();
  const { communeData: communes, isLoading, filters } = useCommuneState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [commune, setCommune] = useState<AllCommuneModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<CommuneModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommuneDetailOpen, setIsCommuneDetailOpen] = useState(false);

  const searchParams = useSearchParams();
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

  const loadCommune = useCallback(async () => {
    try {
      const response = await getAllCommuneService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      });
      setCommune(response);
    } catch (error: any) {
      console.error("Failed to fetch commune: ", error);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadCommune();
  }, [loadCommune, debouncedSearchQuery, statusFilter]);

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
      loadCommune();
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
      loadCommune();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete commune",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCommune = (communeItem: CommuneModel) => {
    setSelectedCommune(communeItem);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddCommune = () => {
    setSelectedCommune(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewCommuneDetail = (communeItem: CommuneModel) => {
    setSelectedCommune(communeItem);
    setIsCommuneDetailOpen(true);
  };

  const handleDeleteCommune = (communeItem: CommuneModel) => {
    setSelectedCommune(communeItem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communes"
        subtitle="Manage commune database records"
        icon={MapPin}
        count={communes?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
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
            <Button size="sm" onClick={handleAddCommune}>New</Button>
          </div>

          <div className="w-full">
            <Separator className="bg-gray-300" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
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
                  getRowKey={(communeItem) => communeItem.id}
                />
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
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CommunePage() {
  return (
    <Suspense fallback={<Loading />}>
      <CommunePageContent />
    </Suspense>
  );
}