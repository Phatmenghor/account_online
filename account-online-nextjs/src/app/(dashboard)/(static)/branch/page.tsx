"use client";

import { PageHeader } from "@/components/shared/common/page-header";
import { useBranchState } from "@/features/master-data/store/state/branch-state";
import { setSearchFilter } from "@/features/master-data/store/slices/branch-slice";
import { createBranchThunk, updateBranchThunk, deleteBranchThunk } from "@/features/master-data/store/thunks/branch-thunks";
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
import { Search, GitBranch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { createBranchTableColumns } from "@/features/master-data/table/branch-content";
import {
  AllBranchModel,
  BranchModel,
} from "@/features/master-data/types/branch/branch.response";
import {
  CreateBranchReq,
  UpdateBranchReq,
} from "@/features/master-data/types/branch/branch.request";
import {
  getAllBranchService,
} from "@/features/master-data/services/branch/branch.service";
import BranchViewModal from "@/features/master-data/components/branch-detail-modal";
import ModalBranch from "@/features/master-data/components/branch-modal";

function BranchPageContent() {
  const dispatch = useAppDispatch();
  const { branchData: branchs, isLoading, filters } = useBranchState();
  const searchQuery = filters.search;
  const statusFilter = filters.status;
  const [branch, setBranch] = useState<AllBranchModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);

  const searchParams = useSearchParams();
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
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadBranch();
  }, [loadBranch, debouncedSearchQuery, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleSaveBranch = async (
    formData: CreateBranchReq | { id: number; updates: UpdateBranchReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateBranchReq;
        await dispatch(createBranchThunk(createData)).unwrap();
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
        await dispatch(updateBranchThunk({ id: updateData.id, updates: updateData.updates })).unwrap();
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
        message: "Failed to save branch status",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReference = async () => {
    if (!selectedBranch) return;
    setIsSubmitting(true);
    try {
      await dispatch(deleteBranchThunk(selectedBranch.id)).unwrap();
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

  const handleEditBranch = (branchItem: BranchModel) => {
    setSelectedBranch(branchItem);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewBranchDetail = (branchItem: BranchModel) => {
    setSelectedBranch(branchItem);
    setIsReferenceDetailOpen(true);
  };

  const handleDeleteBranch = (branchItem: BranchModel) => {
    setSelectedBranch(branchItem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Branches"
        subtitle="Manage CPBank branch directories"
        icon={GitBranch}
        count={branchs?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-branch"
                autoComplete="search-branch"
                type="search"
                placeholder="Search branch..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
                disabled={isSubmitting}
              />
            </div>
            <Button size="sm" onClick={handleAddBranch}>New</Button>
          </div>

          <div className="w-full">
            <Separator className="bg-gray-300" />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={branchs?.content || []}
                  columns={createBranchTableColumns({
                    data: branchs,
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
                <div className="border-t bg-background p-2 flex justify-end">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={branchs?.totalPages || 1}
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
    </div>
  );
}

export default function ReferencePage() {
  return (
    <Suspense fallback={<Loading />}>
      <BranchPageContent />
    </Suspense>
  );
}
