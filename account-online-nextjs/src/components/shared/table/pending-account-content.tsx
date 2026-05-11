import { Button } from "@/components/ui/button";
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
  handleApproveClick: (account: PendingAccountAdminReviewDto) => void;
  handleRejectClick: (account: PendingAccountAdminReviewDto) => void;
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
    handleApproveClick,
    handleRejectClick,
  } = handlers;

  const tCommon = useTranslations("common");

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "default";
    let bgColor = "bg-yellow-100 text-yellow-800";

    if (statusLower.includes("pending")) {
      bgColor = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("approved")) {
      bgColor = "bg-green-100 text-green-800";
    } else if (statusLower.includes("rejected")) {
      bgColor = "bg-red-100 text-red-800";
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  const getAmlStatusBadge = (amlStatus: string) => {
    const statusLower = amlStatus?.toLowerCase() || "unknown";
    let bgColor = "bg-gray-100 text-gray-800";

    if (statusLower.includes("pass")) {
      bgColor = "bg-green-100 text-green-800";
    } else if (statusLower.includes("fail")) {
      bgColor = "bg-red-100 text-red-800";
    } else if (statusLower.includes("warning")) {
      bgColor = "bg-orange-100 text-orange-800";
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {amlStatus}
      </span>
    );
  };

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
      maxWidth: "150px",
      minWidth: "120px",
      render: (account) => (
        <span className="font-medium text-blue-600">{account.legalId}</span>
      ),
    },

    // Customer Name
    {
      key: "givenName",
      label: "Full Name",
      truncate: true,
      maxWidth: "200px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium">
          {account.givenName} {account.familyName}
        </span>
      ),
    },

    // Phone
    {
      key: "phoneNumber",
      label: "Phone",
      truncate: true,
      maxWidth: "140px",
      minWidth: "120px",
      render: (account) => <span>{account.phoneNumber || "---"}</span>,
    },

    // AML Status
    {
      key: "amlStatus",
      label: "AML Status",
      truncate: true,
      maxWidth: "140px",
      minWidth: "120px",
      render: (account) =>
        getAmlStatusBadge(account.amlInfo?.status || "Unknown"),
    },

    // Request Status
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "140px",
      minWidth: "120px",
      render: (account) => getStatusBadge(account.status),
    },

    // Created Date
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "160px",
      minWidth: "140px",
      render: (account) => (
        <span className="text-sm">
          {new Date(account.createdAt).toLocaleDateString()}
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
                  onClick={() => handleApproveClick(account)}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Reject */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectClick(account)}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
