"use client";

import { useDistrictState } from '@/features/master-data/store/state/district-state';
import { setPageNo, setSearchFilter, setStatusFilter } from '@/features/master-data/store/slices/district-slice';
import { fetchAllDistrictService, createDistrictThunk, updateDistrictThunk, deleteDistrictThunk } from '@/features/master-data/store/thunks/district-thunks';
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
  AllDistrictModel,
  DistrictModel,
} from "@/features/master-data/types/district/district.response";
import Loading from "@/components/shared/common/loading";
import { createDistrictTableColumns } from "@/features/master-data/table/district-content";
import DistrictViewModal from "@/features/master-data/components/district-detail-modal";
import ModalDistrict from "@/features/master-data/components/district-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateDistrictReq,
  UpdateDistrictReq,
} from "@/features/master-data/types/district/district.request";
import {
  createDistrictService,
  deleteDistrictService,
  getAllDistrictService,
  updateDistrictService,
} from "@/features/master-data/services/district/district.service";

function DistrictPageContent() {
  const dispatch = useAppDispatch();
  const { districtData: districts, isLoading, filters } = useDistrictState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDistrictDetailOpen, setIsDistrictDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
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

  const loadDistricts = useCallback(async () => {
    try {
      dispatch(fetchAllDistrictService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      }));
    } catch (error: any) {
      console.error("Failed to fetch districts: ", error);
    } finally {
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts, debouncedSearchQuery]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
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
      loadDistricts();
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
      loadDistricts();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete district",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDistrict = (district: DistrictModel) => {
    setSelectedDistrict(district);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddDistrict = () => {
    setSelectedDistrict(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewDistrictDetail = (district: DistrictModel) => {
    setSelectedDistrict(district);
    setIsDistrictDetailOpen(true);
  };

  const handleDeleteDistrict = (district: DistrictModel) => {
    setSelectedDistrict(district);
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
                aria-label="search-district"
                autoComplete="search-district"
                type="search"
                placeholder="Search districts..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleAddDistrict}>New</Button>
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
                getRowKey={(district) => district.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
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
          itemName={
            selectedDistrict?.districtEn || selectedDistrict?.districtKh
          }
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
          provinces={[]} // TODO: Add provinces list from API
        />
      </CardContent>
    </Card>
  );
}

export default function DistrictPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DistrictPageContent />
    </Suspense>
  );
}
