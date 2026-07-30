"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { PageHeader } from "@/components/shared/common/page-header";
import { TableToolbar } from "@/components/shared/common/table-toolbar";
import { Baby } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { AppToast } from "@/components/shared/toast/app-toast";
import { axiosClientWithAuth } from "@/utils/axios";
import SuccessAccountDetailModal from "@/features/account-opening/components/success-account-detail-modal";
import { createJuniorSuccessAccountTableColumns } from "@/features/account-opening/table/junior-success-account-content";

function JuniorSuccessAccountContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.JUNIOR_ACCOUNT_SUCCESS,
  });

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosClientWithAuth.post("/api/v1/junior-account/all-final", {
        pageNo: currentPage,
        pageSize: 15,
        search: debouncedSearchQuery,
      });
      const resData = res.data?.data || res.data || {};
      setAccounts(resData);
    } catch (err) {
      console.error(err);
      AppToast({ type: "error", message: "Failed to fetch Junior accounts" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleViewAccountDetail = (account: any) => {
    setSelectedAccount({ ...account, isJunior: true });
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Junior Successful Accounts"
        subtitle="View and manage created CPBank Junior Savings accounts"
        icon={Baby}
        count={accounts?.totalElements || accounts?.countAll || 0}
        countLabel="accounts"
      />
      <Card className="h-full flex flex-col">
        <CardContent className="space-y-6 p-6 flex flex-col h-full">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            searchPlaceholder="Search by CIF, NID"
            searchAriaLabel="search-junior-account"
            disabled={isLoading}
          />

          <Separator className="bg-gray-300" />

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto">
                <DataTable
                  data={accounts?.content || accounts?.data || []}
                  columns={createJuniorSuccessAccountTableColumns({
                    data: accounts,
                    handlers: { handleViewAccountDetail },
                  })}
                  loading={isLoading}
                  emptyMessage="No Junior success accounts found"
                  getRowKey={(item) => item.id || item.cif}
                />
              </div>
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={accounts?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>

          <SuccessAccountDetailModal
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedAccount(null);
            }}
            account={selectedAccount ?? undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function JuniorAccountSuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JuniorSuccessAccountContent />
    </Suspense>
  );
}
