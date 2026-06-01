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
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { createBranchTableColumns } from "@/components/shared/table/branch-content";
import {
  AllBranchModel,
  BranchModel,
} from "@/models/static/branch/branch.response";
import {
  CreateBranchReq,
  UpdateBranchReq,
} from "@/models/static/branch/branch.request";
import {
  createBranchService,
  deleteBranchService,
  getAllBranchService,
  updateBranchService,
} from "@/services/dashboard/branch/branch.service";
import BranchViewModal from "@/components/shared/modal/branch-detail-modal";
import ModalBranch from "@/components/shared/modal/branch-modal";

function BranchPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [branch, setBranch] = useState<AllBranchModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<BranchModel | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.BRANCH,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadBranch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllBranchService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setBranch(response);
    } catch (error: any) {
      console.error("Failed to fetch branch: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadBranch();
  }, [loadBranch, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveBranch = async (
    formData: CreateBranchReq | { id: number; updates: UpdateBranchReq },
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateBranchReq;

        const response = await createBranchService({
          branchCode: createData.branchCode,
          branchKh: createData.branchKh,
        });

        // Optimistic update
        setBranch((prev: any) =>
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
            message: "Branch created successfully",
            description: "New Branch",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateBranchReq };

        if (!updateData.id) {
          console.error("Missing branch id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateBranchService(
          updateData.id,
          updateData.updates,
        );

        setBranch((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((branch) =>
                  branch.id === updateData.id ? response : branch,
                ),
              }
            : prev,
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Branch updated successfully",
            description: "Updated Branch",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedBranch(null);
      loadBranch();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to save branch",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReference = async () => {
    if (!selectedBranch) return;
    setIsSubmitting(true);
    try {
      await deleteBranchService(selectedBranch.id);
      AppToast({
        type: "success",
        message: "Branch deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedBranch(null);
      loadBranch();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete branch",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBranch = (branch: BranchModel) => {
    setSelectedBranch(branch);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewBranchDetail = (branch: BranchModel) => {
    setSelectedBranch(branch);
    setIsReferenceDetailOpen(true);
  };

  const handleDeleteBranch = (branch: BranchModel) => {
    setSelectedBranch(branch);
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
                aria-label="search-branch"
                autoComplete="search-branch"
                type="search"
                placeholder="Search branch..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <Button onClick={handleAddBranch}>New</Button>
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
                data={branch?.content || []}
                columns={createBranchTableColumns({
                  data: branch,
                  handlers: {
                    handleEditBranch,
                    handleViewBranchDetail,
                    handleDeleteBranch,
                  },
                })}
                loading={isLoading}
                emptyMessage="No branch found"
                getRowKey={(reference) => reference.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={branch?.totalPages || 1}
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
            setSelectedBranch(null);
          }}
          onDelete={confirmDeleteReference}
          title="Delete Branch"
          description={`Are you sure you want to delete this branch`}
          itemName={selectedBranch?.branchCode || selectedBranch?.branchKh}
          isSubmitting={isSubmitting}
        />

        <BranchViewModal
          isOpen={isReferenceDetailOpen}
          onClose={() => {
            setIsReferenceDetailOpen(false);
            setSelectedBranch(null);
          }}
          branch={selectedBranch ?? undefined}
          branchId={selectedBranch?.id ?? 0}
        />

        <ModalBranch
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedBranch(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveBranch}
          branchId={selectedBranch?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function ReferencePage() {
  return (
    <Suspense fallback={<Loading />}>
      <BranchPageContent />
    </Suspense>
  );
}
