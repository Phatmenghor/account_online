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
import { toast } from "sonner";
import {
  AllLegalTypeModel,
  LegalTypeModel,
} from "@/models/static/legal-type/legal-type.response";
import Loading from "@/components/shared/common/loading";
import { createLegalTypeTableColumns } from "@/components/shared/table/legal-type-content";
import LegalTypeViewModal from "@/components/shared/modal/legal-type-detail-modal";
import ModalLegalType from "@/components/shared/modal/legal-type-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  AllLegalTypeReq,
  CreateLegalTypeReq,
  UpdateLegalTypeReq,
} from "@/models/static/legal-type/legal-type.request";
import {
  createLegalTypeService,
  deleteLegalTypeService,
  getAllLegalTypeService,
  updateLegalTypeService,
} from "@/services/dashboard/legal-type/legal-type.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function LegalTypePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [legalTypes, setLegalTypes] = useState<AllLegalTypeModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
    setIsLoading(true);
    try {
      const response = await getAllLegalTypeService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setLegalTypes(response);
    } catch (error: any) {
      console.error("Failed to fetch legal types: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadLegalTypes();
  }, [loadLegalTypes, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveLegalType = async (
    formData: CreateLegalTypeReq | { id: number; updates: UpdateLegalTypeReq },
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateLegalTypeReq;

        const response = await createLegalTypeService({
          nameEn: createData.nameEn,
          nameKh: createData.nameKh,
          legalTypeValue: createData.legalTypeValue,
          status: createData.status,
        });

        // Optimistic update
        setLegalTypes((prev: any) =>
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
            message: "Legal Type created successfully",
            description: "New Legal Type",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as {
          id: number;
          updates: UpdateLegalTypeReq;
        };

        if (!updateData.id) {
          console.error("Missing legal type id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateLegalTypeService(
          updateData.id,
          updateData.updates,
        );

        setLegalTypes((prev: any) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((legalType: any) =>
                  legalType.id === updateData.id ? response : legalType,
                ),
              }
            : prev,
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Legal Type updated successfully",
            description: "Updated Legal Type",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedLegalType(null);
      loadLegalTypes();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save legal type");
      AppToast({
        type: "error",
        message: "Failed to save legal type",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteLegalType = async () => {
    if (!selectedLegalType) return;
    setIsSubmitting(true);
    try {
      await deleteLegalTypeService(selectedLegalType.id);
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
    setStatusFilter(status);
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
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-legal-type"
                autoComplete="search-legal-type"
                type="search"
                placeholder="Search legal types..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>

            {/* Status Filter Dropdown */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_USER_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={handleAddLegalType}>New</Button>
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
  );
}

export default function LegalTypePage() {
  return (
    <Suspense fallback={<Loading />}>
      <LegalTypePageContent />
    </Suspense>
  );
}
