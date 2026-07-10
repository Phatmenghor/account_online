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
  AllReferenceModel,
  ReferenceModel,
} from "@/models/static/reference/reference.response";
import Loading from "@/components/shared/common/loading";
import { createReferenceTableColumns } from "@/components/shared/table/reference-content";
import ReferenceViewModal from "@/components/shared/modal/reference-detail-modal";
import ModalReference from "@/components/shared/modal/reference-modal";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import {
  CreateReferenceReq,
  UpdateReferenceReq,
} from "@/models/static/reference/reference.request";
import {
  createReferenceService,
  deleteReferenceService,
  getAllReferenceService,
  updateReferenceService,
} from "@/services/dashboard/reference/reference.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_USER_OPTIONS } from "@/constants/AppResource/filter/status";

function ReferencePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [references, setReferences] = useState<AllReferenceModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReference, setSelectedReference] =
    useState<ReferenceModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.REFERENCE,
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
      const response = await getAllReferenceService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setReferences(response);
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

  const handleSaveReference = async (
    formData: CreateReferenceReq | { id: number; updates: UpdateReferenceReq },
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateReferenceReq;

        const response = await createReferenceService({
          nameEn: createData.nameEn,
          nameKh: createData.nameKh,
          status: createData.status,
        });

        // Optimistic update
        setReferences((prev: any) =>
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
            message: "Bank created successfully",
            description: "New Bank",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as {
          id: number;
          updates: UpdateReferenceReq;
        };

        if (!updateData.id) {
          console.error("Missing reference id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateReferenceService(
          updateData.id,
          updateData.updates,
        );

        setReferences((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((reference) =>
                  reference.id === updateData.id ? response : reference,
                ),
              }
            : prev,
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Bank updated successfully",
            description: "Updated Bank",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedReference(null);
      loadReferences();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save bank",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReference = async () => {
    if (!selectedReference) return;
    setIsSubmitting(true);
    try {
      await deleteReferenceService(selectedReference.id);
      AppToast({
        type: "success",
        message: "Bank deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedReference(null);
      loadReferences();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete bank",
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

  const handleEditReference = (reference: ReferenceModel) => {
    setSelectedReference(reference);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddReference = () => {
    setSelectedReference(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewReferenceDetail = (reference: ReferenceModel) => {
    setSelectedReference(reference);
    setIsReferenceDetailOpen(true);
  };

  const handleDeleteReference = (reference: ReferenceModel) => {
    setSelectedReference(reference);
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
                aria-label="search-reference"
                autoComplete="search-reference"
                type="search"
                placeholder="Search references..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleAddReference}>New</Button>
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
                data={references?.content || []}
                columns={createReferenceTableColumns({
                  data: references,
                  handlers: {
                    handleEditReference,
                    handleViewReferenceDetail,
                    handleDeleteReference,
                  },
                })}
                loading={isLoading}
                emptyMessage="No bank found"
                getRowKey={(reference) => reference.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={references?.totalPages || 1}
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
            setSelectedReference(null);
          }}
          onDelete={confirmDeleteReference}
          title="Delete Bank"
          description={`Are you sure you want to delete this bank`}
          itemName={selectedReference?.nameEn || selectedReference?.nameKh}
          isSubmitting={isSubmitting}
        />

        <ReferenceViewModal
          isOpen={isReferenceDetailOpen}
          onClose={() => {
            setIsReferenceDetailOpen(false);
            setSelectedReference(null);
          }}
          reference={selectedReference ?? undefined}
          referenceId={selectedReference?.id ?? 0}
        />

        <ModalReference
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedReference(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveReference}
          referenceId={selectedReference?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function ReferencePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReferencePageContent />
    </Suspense>
  );
}
