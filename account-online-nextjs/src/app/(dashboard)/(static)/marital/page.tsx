"use client";

import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { useMaritalState } from "@/features/master-data/store/state/marital-state";
import { setSearchFilter } from "@/features/master-data/store/slices/marital-slice";
import { createMaritalThunk, updateMaritalThunk, deleteMaritalThunk } from "@/features/master-data/store/thunks/marital-thunks";
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
import { Search, Heart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { createMaritalTableColumns } from "@/features/master-data/table/marital-content";
import {
  AllMaritalModel,
  MaritalModel,
} from "@/features/master-data/types/marital/marital.response";
import {
  CreateMaritalReq,
  UpdateMaritalReq,
} from "@/features/master-data/types/marital/marital.request";
import {
  getAllMaritalService,
} from "@/features/master-data/services/marital/marital.service";
import MaritalViewModal from "@/features/master-data/components/marital-detail-modal";
import ModalMarital from "@/features/master-data/components/marital-modal";

function MaritalPageContent() {
  const dispatch = useAppDispatch();
  const { maritalData: maritals, isLoading, filters } = useMaritalState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [marital, setMarital] = useState<AllMaritalModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMarital, setSelectedMarital] = useState<MaritalModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaritalDetailOpen, setIsMaritalDetailOpen] = useState(false);

  const searchParams = useSearchParams();
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

  const loadMarital = useCallback(async () => {
    try {
      const response = await getAllMaritalService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setMarital(response);
    } catch (error: any) {
      console.error("Failed to fetch marital: ", error);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadMarital();
  }, [loadMarital, debouncedSearchQuery, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveMarital = async (
    formData: CreateMaritalReq | { id: number; updates: UpdateMaritalReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateMaritalReq;
        await dispatch(createMaritalThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Marital status created successfully",
            description: "New Marital",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateMaritalReq };
        if (!updateData.id) {
          console.error("Missing marital id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateMaritalThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Marital status updated successfully",
            description: "Updated Marital",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedMarital(null);
      loadMarital();
    } catch (err: any) {
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
      await dispatch(deleteMaritalThunk(selectedMarital.id)).unwrap();
      AppToast({
        type: "success",
        message: "Marital status deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedMarital(null);
      loadMarital();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete marital status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMarital = (maritalItem: MaritalModel) => {
    setSelectedMarital(maritalItem);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddMarital = () => {
    setSelectedMarital(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewMaritalDetail = (maritalItem: MaritalModel) => {
    setSelectedMarital(maritalItem);
    setIsMaritalDetailOpen(true);
  };

  const handleDeleteMarital = (maritalItem: MaritalModel) => {
    setSelectedMarital(maritalItem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Marital Statuses"
        subtitle="Manage marital status classifications"
        icon={Heart}
        count={maritals?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search marital status..."
            searchAriaLabel="search-marital"
            disabled={isSubmitting}
            actions={<Button size="sm" onClick={handleAddMarital}>New</Button>}
          />

          <div className="w-full">
            <Separator className="bg-gray-300" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
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
                  emptyMessage="No marital statuses found"
                  getRowKey={(maritalItem) => maritalItem.id}
                />
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
    </div>
  );
}

export default function MaritalPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MaritalPageContent />
    </Suspense>
  );
}