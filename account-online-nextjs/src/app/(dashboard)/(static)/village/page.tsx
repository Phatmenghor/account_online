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
  AllVillageModel,
  VillageModel,
} from "@/models/static/village/village.response";
import Loading from "@/components/shared/common/loading";
import { createVillageTableColumns } from "@/components/shared/table/village-content";
import VillageViewModal from "@/components/shared/modal/village-detail-modal";
import ModalVillage from "@/components/shared/modal/village-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateVillageReq,
  UpdateVillageReq,
} from "@/models/static/village/village.request";
import {
  createVillageService,
  deleteVillageService,
  getAllVillageService,
  updateVillageService,
} from "@/services/dashboard/village/village.service";

function VillagePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [villages, setVillages] = useState<AllVillageModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<VillageModel | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVillageDetailOpen, setIsVillageDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.VILLAGE,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadVillages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllVillageService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      });
      setVillages(response);
    } catch (error: any) {
      console.error("Failed to fetch villages: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadVillages();
  }, [loadVillages, debouncedSearchQuery]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveVillage = async (
    formData: CreateVillageReq | { id: number; updates: UpdateVillageReq },
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateVillageReq;

        const response = await createVillageService({
          villageCode: createData.villageCode,
          villageEn: createData.villageEn,
          villageKh: createData.villageKh,
          communeCode: createData.communeCode,
        });

        // Optimistic update
        setVillages((prev: any) =>
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
            message: "Village created successfully",
            description: "New Village",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as {
          id: number;
          updates: UpdateVillageReq;
        };

        if (!updateData.id) {
          console.error("Missing village id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateVillageService(
          updateData.id,
          updateData.updates,
        );

        setVillages((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((village) =>
                  village.id === updateData.id ? response : village,
                ),
              }
            : prev,
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Village updated successfully",
            description: "Updated Village",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedVillage(null);
      loadVillages();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save village",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteVillage = async () => {
    if (!selectedVillage) return;
    setIsSubmitting(true);
    try {
      await deleteVillageService(selectedVillage.id);
      AppToast({
        type: "success",
        message: "Village deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVillage(null);
      loadVillages();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete village",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVillage = (village: VillageModel) => {
    setSelectedVillage(village);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddVillage = () => {
    setSelectedVillage(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewVillageDetail = (village: VillageModel) => {
    setSelectedVillage(village);
    setIsVillageDetailOpen(true);
  };

  const handleDeleteVillage = (village: VillageModel) => {
    setSelectedVillage(village);
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
                aria-label="search-village"
                autoComplete="search-village"
                type="search"
                placeholder="Search villages..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <Button onClick={handleAddVillage}>New</Button>
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
                data={villages?.content || []}
                columns={createVillageTableColumns({
                  data: villages,
                  handlers: {
                    handleEditVillage,
                    handleViewVillageDetail,
                    handleDeleteVillage,
                  },
                })}
                loading={isLoading}
                emptyMessage="No villages found"
                getRowKey={(village) => village.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={villages?.totalPages || 1}
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
            setSelectedVillage(null);
          }}
          onDelete={confirmDeleteVillage}
          title="Delete Village"
          description={`Are you sure you want to delete this village`}
          itemName={selectedVillage?.villageEn || selectedVillage?.villageKh}
          isSubmitting={isSubmitting}
        />

        <VillageViewModal
          isOpen={isVillageDetailOpen}
          onClose={() => {
            setIsVillageDetailOpen(false);
            setSelectedVillage(null);
          }}
          village={selectedVillage ?? undefined}
          villageId={selectedVillage?.id ?? 0}
        />

        <ModalVillage
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedVillage(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveVillage}
          villageId={selectedVillage?.id ?? 0}
          isSubmitting={isSubmitting}
          communes={[]} // TODO: Add communes list from API
        />
      </CardContent>
    </Card>
  );
}

export default function VillagePage() {
  return (
    <Suspense fallback={<Loading />}>
      <VillagePageContent />
    </Suspense>
  );
}
