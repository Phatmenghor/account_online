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
import { TableColumn } from "@/components/shared/table/data-table";
import {
  AllAmlManagementModel,
  AmlManagementModel,
} from "@/features/aml/types/management/response/aml-management.response";
import RiskBadge from "@/components/shared/badge/risk-level-badge";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import { Span } from "next/dist/trace";

interface ManagementTableHandlers {
  handleViewManagementDetail: (management: AmlManagementModel) => void;
  openConfirmAmlDialog: (
    management: AmlManagementModel,
    status: AmlStatusEnum
  ) => void;
}

interface ManagementTableOptions {
  data: AllAmlManagementModel | null;
  handlers: ManagementTableHandlers;
}

export const createManagementTableColumns = ({
  data,
  handlers,
}: ManagementTableOptions): TableColumn<AmlManagementModel>[] => {
  const { handleViewManagementDetail, openConfirmAmlDialog } = handlers;

  const tCommon = useTranslations("common");
  const tMaster = useTranslations("master");

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
      maxWidth: "250px",
      minWidth: "20px",
      render: (m) => (
        <span className="font-medium">{m.customerInfo?.legalId || "---"}</span>
      ),
    },

    // Customer Name
    {
      key: "customerName",
      label: "Customer Name",
      truncate: true,
      maxWidth: "240px",
      minWidth: "180px",
      render: (m) => (
        <span className="font-medium">
          {m.customerInfo?.givenName} {m.customerInfo?.familyName || "---"}
        </span>
      ),
    },

    // Risk Level
    {
      key: "riskLevel",
      label: "Risk Level",
      truncate: true,
      maxWidth: "250px",
      minWidth: "20px",
      render: (m) => <RiskBadge riskLevel={m.riskLevel || "---"} />,
    },

    // Total Score
    {
      key: "totalRulesScore",
      label: "Score",
      maxWidth: "100px",
      minWidth: "80px",
      render: (m) => (
        <span className="font-medium">{m.totalRulesScore ?? "---"}</span>
      ),
    },

    // Created Date
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "160px",
      minWidth: "150px",
      render: (m) => (
        <span className="font-medium">
          {new Date(m.createdAt).toLocaleString() || "---"}
        </span>
      ),
    },

    // Status
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "120px",
      minWidth: "120px",
      render: (m) => <AmlStatusBadge status={m.status || "---"} />,
     
    },

    // Actions
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (management) => (
        <div className="flex items-center gap-2">
          {/* View */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewManagementDetail(management)}
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
                  onClick={() =>
                    openConfirmAmlDialog(management, AmlStatusEnum.APPROVE)
                  }
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
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
                  onClick={() =>
                    openConfirmAmlDialog(management, AmlStatusEnum.REJECT)
                  }
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



