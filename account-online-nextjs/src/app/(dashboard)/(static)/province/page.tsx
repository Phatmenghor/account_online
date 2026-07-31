"use client";

import { PageHeader } from '@/components/shared/common/page-header';
import { TableToolbar } from "@/components/shared/common/table-toolbar";

import { useProvinceState } from '@/features/master-data/store/state/province-state';
import { setSearchFilter } from '@/features/master-data/store/slices/province-slice';
import { fetchAllProvinceService, createProvinceThunk, updateProvinceThunk, deleteProvinceThunk } from '@/features/master-data/store/thunks/province-thunks';
import { useAppDispatch } from '@/store/store';

import { Suspense, startTransition, useCallback, useEffect, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { ProvinceModel } from "@/features/master-data/types/province/province.response";
import ProvinceViewModal from "@/features/master-data/components/province-detail-modal";
import ModalProvince from "@/features/master-data/components/province-modal";
import { createProvinceTableColumns } from "@/features/master-data/table/province-content";
import {
  CreateProvinceReq,
  UpdateProvinceReq,
} from "@/features/master-data/types/province/province.request";


function ProvincePageContent() {
  const dispatch = useAppDispatch();
  const { provinceData: provinces, isLoading, filters } = useProvinceState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvince, setSelectedProvince] =
    useState<ProvinceModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);

  const searchParams = useSearchParams();


  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.PROVINCE,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadReferences = useCallback(() => {
    dispatch(
      fetchAllProvinceService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
    );
  }, [dispatch, debouncedSearchQuery, statusFilter, currentPage]);



  useEffect(() => {
    loadReferences();
  }, [loadReferences, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveProvince = async (
    formData: CreateProvinceReq | { id: number; updates: UpdateProvinceReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateProvinceReq;
        await dispatch(createProvinceThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Province created successfully",
            description: "New Province",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateProvinceReq };
        if (!updateData.id) {
          console.error("Missing province id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateProvinceThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "Province updated successfully",
            description: "Updated Province",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedProvince(null);
      loadReferences();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save province status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReference = async () => {
    if (!selectedProvince) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteProvinceThunk(selectedProvince.id)).unwrap();
      AppToast({
        type: "success",
        message: "Province deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProvince(null);
      loadReferences();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete province",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProvince = (province: ProvinceModel) => {
    setSelectedProvince(province);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddProvince = () => {
    setSelectedProvince(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewProvinceDetail = (province: ProvinceModel) => {
    setSelectedProvince(province);
    setIsReferenceDetailOpen(true);
  };

  const handleDeleteProvince = (province: ProvinceModel) => {
    setSelectedProvince(province);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Provinces"
        subtitle="Manage CPBank provinces"
        icon={MapPin}
        count={provinces?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search province..."
            searchAriaLabel="search-province"
            disabled={isSubmitting}
            actions={<Button size="sm" onClick={handleAddProvince}>New</Button>}
          />

          <div className="w-full">
            <Separator className="bg-gray-300" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={provinces?.content || []}
                  columns={createProvinceTableColumns({
                    data: provinces,
                    handlers: {
                      handleEditProvince,
                      handleViewProvinceDetail,
                      handleDeleteProvince,
                    },
                  })}
                  loading={isLoading}
                  emptyMessage="No Province found"
                  getRowKey={(reference) => reference.id}
                />
                <div className="border-t bg-background p-2 flex justify-end">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={provinces?.totalPages || 1}
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
            setSelectedProvince(null);
          }}
          onDelete={confirmDeleteReference}
          title="Delete Province"
          description={`Are you sure you want to delete this province`}
          itemName={
            selectedProvince?.provinceEn || selectedProvince?.provinceKh
          }
          isSubmitting={isSubmitting}
        />

        <ProvinceViewModal
          province={selectedProvince ?? undefined}
          provinceId={selectedProvince?.id ?? 0}
          isOpen={isReferenceDetailOpen}
          onClose={() => {
            setIsReferenceDetailOpen(false);
            setSelectedProvince(null);
          }}
        />

        <ModalProvince
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedProvince(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveProvince}
          provinceId={selectedProvince?.id ?? 0}
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
      <ProvincePageContent />
    </Suspense>
  );
}

