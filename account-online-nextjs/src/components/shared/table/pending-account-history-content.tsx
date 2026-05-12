import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableColumn } from "./data-table";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
} from "@/models/open-account-admin/pending-account.response";
import { Badge } from "@/components/ui/badge";

interface PendingAccountHistoryTableHandlers {
  handleViewDetail: (account: PendingAccountAdminReviewDto) => void;
}

interface PendingAccountHistoryTableOptions {
  data: PaginationResponse<PendingAccountAdminReviewDto> | null;
  handlers: PendingAccountHistoryTableHandlers;
}

export const createPendingAccountHistoryTableColumns = ({
  data,
  handlers,
}: PendingAccountHistoryTableOptions): TableColumn<PendingAccountAdminReviewDto>[] => {
  const { handleViewDetail } = handlers;

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },

    // Legal ID
    {
      key: "legalId",
      label: "ID Number",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (account) => (
        <span className="font-medium">{account.legalId || "---"}</span>
      ),
    },

    // Customer Name
    {
      key: "customerName",
      label: "Full Name",
      truncate: true,
      maxWidth: "240px",
      minWidth: "180px",
      render: (account) => {
        const name = `${account.legalFirstNameEn || ""} ${account.legalLastNameEn || ""}`.trim() || "---";
        return <span className="font-medium">{name}</span>;
      },
    },

    // Status
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "140px",
      minWidth: "120px",
      render: (account) => {
        const status = account.status || "---";
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";

        if (status === "APPROVED") {
          badgeVariant = "default";
        } else if (status === "REJECTED") {
          badgeVariant = "destructive";
        }

        return <Badge variant={badgeVariant}>{status}</Badge>;
      },
    },

    // Processed At (Updated At for history)
    {
      key: "updatedAt",
      label: "Processed At",
      truncate: true,
      maxWidth: "160px",
      minWidth: "150px",
      render: (account) => (
        <span className="font-medium">
          {new Date(account.updatedAt).toLocaleString() || "---"}
        </span>
      ),
    },

    // Actions
    {
      key: "actions",
      label: "Actions",
      maxWidth: "100px",
      minWidth: "80px",
      render: (account) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetail(account)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
