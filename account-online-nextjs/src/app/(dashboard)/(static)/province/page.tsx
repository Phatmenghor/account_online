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
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  AllProvinceModel,
  ProvinceModel,
} from "@/models/static/province/province.response";
import ProvinceViewModal from "@/components/shared/modal/province-detail-modal";
import ModalProvince from "@/components/shared/modal/province-modal";
import { createProvinceTableColumns } from "@/components/shared/table/province-content";
import {
  createProvinceService,
  deleteProvinceService,
  getAllProviceService,
  updateProvinceService,
} from "@/services/dashboard/province/province.service";
import {
  CreateProvinceReq,
  UpdateProvinceReq,
} from "@/models/static/province/province.request";

function ProvincePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [province, setProvince] = useState<AllProvinceModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] =
    useState<ProvinceModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);

  const t = useTranslations();

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

  const loadReferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllProviceService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setProvince(response);
    } catch (error: any) {
      console.error("Failed to fetch references: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveProvince = async (
    formData: CreateProvinceReq | { id: number; updates: UpdateProvinceReq },
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateProvinceReq;

        const response = await createProvinceService({
          provinceCode: createData.provinceCode,
          provinceEn: createData.provinceEn,
          provinceKh: createData.provinceKh,
        });

        // Optimistic update
        setProvince((prev: any) =>
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
            message: "Province created successfully",
            description: "New Province",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as {
          id: number;
          updates: UpdateProvinceReq;
        };

        if (!updateData.id) {
          console.error("Missing reference id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateProvinceService(
          updateData.id,
          updateData.updates,
        );

        setProvince((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((province) =>
                  province.id === updateData.id ? response : province,
                ),
              }
            : prev,
        );

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
        message: "Failed to save province",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReference = async () => {
    if (!selectedProvince) return;
    setIsSubmitting(true);
    try {
      await deleteProvinceService(selectedProvince.id);
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
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <div className="flex justify-between items-center gap-4">
          <div />
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-province"
                autoComplete="search-province"
                type="search"
                placeholder="Search Province Code..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleAddProvince}>New</Button>
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
                data={province?.content || []}
                columns={createProvinceTableColumns({
                  data: province,
                  handlers: {
                    handleEditProvince,
                    handleViewProvinceDetail,
                    handleDeleteProvince,
                  },
                })}
                loading={isLoading}
                emptyMessage="No Province found"
                getRowKey={(province) => province.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={province?.totalPages || 1}
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
  );
}

export default function ReferencePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProvincePageContent />
    </Suspense>
  );
}
