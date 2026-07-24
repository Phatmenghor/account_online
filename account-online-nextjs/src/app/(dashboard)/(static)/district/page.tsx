"use client";

import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { useDistrictState } from "@/features/master-data/store/state/district-state";
import { setSearchFilter } from "@/features/master-data/store/slices/district-slice";
import { createDistrictThunk, updateDistrictThunk, deleteDistrictThunk } from "@/features/master-data/store/thunks/district-thunks";
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
import { createDistrictTableColumns } from "@/features/master-data/table/district-content";
import {
  AllDistrictModel,
  DistrictModel,
} from "@/features/master-data/types/district/district.response";
import {
  CreateDistrictReq,
  UpdateDistrictReq,
} from "@/features/master-data/types/district/district.request";
import {
  getAllDistrictService,
} from "@/features/master-data/services/district/district.service";
import DistrictViewModal from "@/features/master-data/components/district-detail-modal";
import ModalDistrict from "@/features/master-data/components/district-modal";

function DistrictPageContent() {
  const dispatch = useAppDispatch();
  const { districtData: districts, isLoading, filters } = useDistrictState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [district, setDistrict] = useState<AllDistrictModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);

  const searchParams = useSearchParams();
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.DISTRICT,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadDistrict = useCallback(async () => {
    try {
      const response = await getAllDistrictService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      });
      setDistrict(response);
    } catch (error: any) {
      console.error("Failed to fetch district: ", error);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadDistrict();
  }, [loadDistrict, debouncedSearchQuery, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveDistrict = async (
    formData: CreateDistrictReq | { id: number; updates: UpdateDistrictReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateDistrictReq;
        await dispatch(createDistrictThunk(createData)).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "District created successfully",
            description: "New District",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateDistrictReq };
        if (!updateData.id) {
          console.error("Missing district id in update form");
          setIsSubmitting(false);
          return;
        }
        await dispatch(updateDistrictThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
        startTransition(() => {
          AppToast({
            type: "success",
            message: "District updated successfully",
            description: "Updated District",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedDistrict(null);
      loadDistrict();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save district status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteDistrict = async () => {
    if (!selectedDistrict) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteDistrictThunk(selectedDistrict.id)).unwrap();
      AppToast({
        type: "success",
        message: "District deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedDistrict(null);
      loadDistrict();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete district",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDistrict = (districtItem: DistrictModel) => {
    setSelectedDistrict(districtItem);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddDistrict = () => {
    setSelectedDistrict(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewDistrictDetail = (districtItem: DistrictModel) => {
    setSelectedDistrict(districtItem);
    setIsDistrictDetailOpen(true);
  };

  const handleDeleteDistrict = (districtItem: DistrictModel) => {
    setSelectedDistrict(districtItem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Districts"
        subtitle="Manage district database records"
        icon={MapPin}
        count={districts?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search districts..."
            searchAriaLabel="search-district"
            disabled={isSubmitting}
            actions={<Button size="sm" onClick={handleAddDistrict}>New</Button>}
          />

          <div className="w-full">
            <Separator className="bg-gray-300" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={districts?.content || []}
                  columns={createDistrictTableColumns({
                    data: districts,
                    handlers: {
                      handleEditDistrict,
                      handleViewDistrictDetail,
                      handleDeleteDistrict,
                    },
                  })}
                  loading={isLoading}
                  emptyMessage="No districts found"
                  getRowKey={(districtItem) => districtItem.id}
                />
                <div className="border-t bg-background p-2 flex justify-end">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={districts?.totalPages || 1}
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
              setSelectedDistrict(null);
            }}
            onDelete={confirmDeleteDistrict}
            title="Delete District"
            description={`Are you sure you want to delete this district`}
            itemName={selectedDistrict?.districtEn || selectedDistrict?.districtKh}
            isSubmitting={isSubmitting}
          />

          <DistrictViewModal
            isOpen={isDistrictDetailOpen}
            onClose={() => {
              setIsDistrictDetailOpen(false);
              setSelectedDistrict(null);
            }}
            district={selectedDistrict ?? undefined}
            districtId={selectedDistrict?.id ?? 0}
          />

          <ModalDistrict
            isOpen={isModalOpen}
            mode={mode}
            onClose={() => {
              setSelectedDistrict(null);
              setIsModalOpen(false);
            }}
            onSave={handleSaveDistrict}
            districtId={selectedDistrict?.id ?? 0}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DistrictPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DistrictPageContent />
    </Suspense>
  );
}
