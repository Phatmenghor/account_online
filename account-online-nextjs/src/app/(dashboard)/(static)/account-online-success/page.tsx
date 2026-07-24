"use client";

import { Suspense } from "react";
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
import { Search, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import { createSuccessAccountTableColumns } from "@/features/account-opening/table/success-account-content";
import {
  AllSuccessAccountOnlineModel,
  SuccessAccountOnlineModel,
} from "@/features/account-opening/types/success-account-response.model";
import { getSuccessAccountOnlineService } from "@/services/get-account/acc-online-success.service";
import SuccessAccountViewModal from "@/features/account-opening/components/success-account-detail-modal";
import { AppToast } from "@/components/shared/toast/app-toast";

function SuccessAccountPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<AllSuccessAccountOnlineModel | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<SuccessAccountOnlineModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.STATIC.ACCOUNT_ONLINE_SUCCESS,
  });

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSuccessAccountOnlineService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      });
      setAccounts(response);
    } catch (error: any) {
      console.error("Failed to fetch success accounts: ", error);
      AppToast({
        type: "error",
        message: "Failed to fetch success accounts",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewAccountDetail = (account: SuccessAccountOnlineModel) => {
    setSelectedAccount(account);
    setIsDetailOpen(true);
  };



  return (
    <div className="space-y-4">
      <PageHeader
        title="Successful Accounts"
        subtitle="View and manage created online bank accounts"
        icon={CheckCircle2}
        count={accounts?.totalElements}
        countLabel="accounts"
      />
      <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by Legal ID or Name"
          searchAriaLabel="search-success-account"
          disabled={isLoading}
        />

        <Separator className="bg-gray-300" />

        <div className="flex-1 flex flex-col min-h-0">
          {/* Table container with proper overflow handling */}
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={accounts?.content || []}
                columns={createSuccessAccountTableColumns({
                  data: accounts,
                  handlers: {
                    handleViewAccountDetail,
                  },
                })}
                loading={isLoading}
                emptyMessage="No success accounts found"
                getRowKey={(account) => account.id}
              />
              {/* Pagination positioned to the right and outside the scrollable area */}
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
        </div>

        <SuccessAccountViewModal
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

export default function SuccessAccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuccessAccountPageContent />
    </Suspense>
  );
}

