import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TableColumn } from "./data-table";
import {
  PaginationResponse,
  PendingAccountAdminReviewDto,
} from "@/models/open-account-admin/pending-account.response";
import { Badge } from "@/components/ui/badge";

interface PendingAccountTableHandlers {
  handleViewDetail: (account: PendingAccountAdminReviewDto) => void;
  openApproveDialog: (account: PendingAccountAdminReviewDto) => void;
  openRejectDialog: (account: PendingAccountAdminReviewDto) => void;
}

interface PendingAccountTableOptions {
  data: PaginationResponse<PendingAccountAdminReviewDto> | null;
  handlers: PendingAccountTableHandlers;
}

export const createPendingAccountTableColumns = ({
  data,
  handlers,
}: PendingAccountTableOptions): TableColumn<PendingAccountAdminReviewDto>[] => {
  const {
    handleViewDetail,
    openApproveDialog,
    openRejectDialog,
  } = handlers;

  const tCommon = useTranslations("common");

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
        const name = `${account.legalLastNameEn || ""} ${account.legalFirstNameEn || ""}`.trim() || "---";
        return <span className="font-medium">{name}</span>;
      },
    },

    // Phone Number
    {
      key: "phoneNumber",
      label: "Phone Number",
      truncate: true,
      maxWidth: "150px",
      minWidth: "120px",
      render: (account) => (
        <span className="font-medium">{account.phoneNumber || "---"}</span>
      ),
    },

    // Branch Code
    {
      key: "branchCode",
      label: "Branch Code",
      truncate: true,
      maxWidth: "120px",
      minWidth: "100px",
      render: (account) => (
        <span className="font-medium">{account.branchCode || "---"}</span>
      ),
    },

    // AML Status
    {
      key: "amlStatus",
      label: "AML Status",
      truncate: true,
      maxWidth: "140px",
      minWidth: "120px",
      render: (account) => {
        const amlStatus = account.amlStatus || "---";
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";

        if (amlStatus === "PASS" || amlStatus === "CLEAR" || amlStatus === "LOW_RISK") {
          badgeVariant = "default";
        } else if (amlStatus === "FAIL" || amlStatus === "BLOCKED" || amlStatus === "HIGH_RISK") {
          badgeVariant = "destructive";
        } else if (amlStatus === "REVIEW" || amlStatus === "PENDING" || amlStatus === "MEDIUM_RISK") {
          badgeVariant = "secondary";
        }

        return <Badge variant={badgeVariant}>{amlStatus}</Badge>;
      },
    },

    // Request Status
    {
      key: "status",
      label: "Request Status",
      truncate: true,
      maxWidth: "140px",
      minWidth: "120px",
      render: (account) => {
        const status = account.status || "---";
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
        
        if (status === "PENDING") {
          badgeVariant = "secondary";
        } else if (status === "APPROVED") {
          badgeVariant = "default";
        } else if (status === "REJECTED") {
          badgeVariant = "destructive";
        }
        
        return <Badge variant={badgeVariant}>{status}</Badge>;
      },
    },

    // Created Date
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "160px",
      minWidth: "150px",
      render: (account) => (
        <span className="font-medium">
          {new Date(account.createdAt).toLocaleString() || "---"}
        </span>
      ),
    },

    // Actions
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (account) => (
        <div className="flex items-center gap-2">
          {/* View */}
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
              <TooltipContent>{tCommon("view")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Approve */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openApproveDialog(account)}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>បង្ហាក់</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Reject */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRejectDialog(account)}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>បដិសេធ</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
