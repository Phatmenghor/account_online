"use client";

import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { Search, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import { createManagementTableColumns } from "@/features/aml/table/aml-management-content";
import {
  getAllAmlManagementService,
  updateManagementService,
} from "@/features/aml/services/aml-management.service";
import AmlConfirmDialog from "@/components/shared/dialog/dialog-aml";
import {
  AllAmlManagementModel,
  AmlManagementModel,
} from "@/features/aml/types/management/response/aml-management.response";
import AmlViewDetailModal from "@/features/aml/components/aml-management-detail";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import { AppToast } from "@/components/shared/toast/app-toast";

function Management() {
  const [searchQuery, setSearchQuery] = useState("");
  const [amlManagement, setAmlManagement] =
    useState<AllAmlManagementModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter] = useState<string>("PENDING");

  // View Detail Modal
  const [isAmlManagementDetailOpen, setIsAmlManagementDetailOpen] =
    useState(false);
  const [selectedAmlManagement, setSelectedAmlManagement] =
    useState<AmlManagementModel | null>(null);

  // Confirm Dialog
  const [isConfirmAmlDialogOpen, setIsConfirmAmlDialogOpen] = useState(false);
  const [selectedManagementId, setSelectedManagementId] = useState<
    number | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<AmlStatusEnum>(
    AmlStatusEnum.PENDING
  );
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const searchParams = useSearchParams();
  const t = useTranslations();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const router = useRouter();
  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.AML.MANAGEMENT,
  });



  useEffect(() => {
    const legalIdParam = searchParams.get("legalId");
    if (legalIdParam && amlManagement?.content) {
      // Set the search box so table filters by this legalId
      setSearchQuery(legalIdParam);

      // Find the case and open the modal
      const caseToOpen = amlManagement.content.find(
        (item) => item.customerInfo.legalId === legalIdParam
      );
      if (caseToOpen) {
        handleViewManagementDetail(caseToOpen);
      }
    }
  }, [amlManagement, searchParams]);

  const loadManagement = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllAmlManagementService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter,
      });
      setAmlManagement(response);
    } catch (error) {
      console.error("❌ Failed to fetch AML management:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, statusFilter]);

  useEffect(() => {
    loadManagement();
  }, [loadManagement]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // VIEW DETAIL HANDLER
  const handleViewManagementDetail = (management: AmlManagementModel) => {
    setSelectedAmlManagement(management);
    setIsAmlManagementDetailOpen(true);
  };

  // VIEW DETAIL HANDLER
  const handleCloseManagementDetail = () => {
    setSelectedAmlManagement(null);
    setIsAmlManagementDetailOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("legalId");
    router.replace(`${ROUTES.DASHBOARD.AML.MANAGEMENT}?${params.toString()}`);
  };

  // CONFIRM DIALOG
  const openConfirmAmlDialog = (
    management: AmlManagementModel,
    status: AmlStatusEnum
  ) => {
    setSelectedManagementId(management?.id);
    setSelectedStatus(status);
    setIsConfirmAmlDialogOpen(true);
  };

  const handleConfirmAmlStatus = async (comment?: string) => {
    if (!selectedManagementId) return;
    setIsConfirmLoading(true);
    try {
      const response = await updateManagementService(selectedManagementId, {
        status: selectedStatus,
        remark: comment,
      });

      // Optimistic update + remove approved/rejected items
      setAmlManagement((prev: any) => {
        if (!prev) return null;

        const updatedList = prev.content
          // keep everything except the one just updated
          .filter((item: any) => item.id !== selectedManagementId);

        return {
          ...prev,
          content: updatedList,
          totalElements: updatedList.length,
        };
      });

      startTransition(() => {
        AppToast({
          type: "success",
          message: `AML ${selectedStatus} successfully`,
          description: `AML has been ${selectedStatus.toLowerCase()}.`,
        });
      });
    } catch (error) {
      console.error("Error updating AML status:", error);
    } finally {
      setIsConfirmAmlDialogOpen(false);
      setIsConfirmLoading(false);
      setSelectedManagementId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="AML Pending List"
        subtitle="Review and process pending AML cases"
        icon={ShieldAlert}
        count={amlManagement?.totalElements || 0}
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search management"
            searchAriaLabel="search-management"
            disabled={isLoading}
          />

          <Separator className="bg-gray-300" />

          {/* TABLE */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={amlManagement?.content || []}
                  columns={createManagementTableColumns({
                    data: amlManagement,
                    handlers: {
                      handleViewManagementDetail,
                      openConfirmAmlDialog,
                    },
                  })}
                  loading={isLoading}
                  emptyMessage={t("common.loading")}
                  getRowKey={(item) => item.id}
                />
                {/* Pagination */}
                <div className="border-t bg-background p-2 flex justify-end">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={amlManagement?.totalPages || 1}
                    onPageChange={handlePageChange}
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CONFIRM DIALOG */}
          <AmlConfirmDialog
            isLoading={isConfirmLoading}
            isOpen={isConfirmAmlDialogOpen}
            onClose={() => setIsConfirmAmlDialogOpen(false)}
            status={selectedStatus}
            onConfirm={handleConfirmAmlStatus}
          />

          {/* VIEW DETAIL MODAL */}
          <AmlViewDetailModal
            isOpen={isAmlManagementDetailOpen}
            onClose={handleCloseManagementDetail}
            alert={selectedAmlManagement!}
            alertId={selectedAmlManagement?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManagementPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Management />
    </Suspense>
  );
}



