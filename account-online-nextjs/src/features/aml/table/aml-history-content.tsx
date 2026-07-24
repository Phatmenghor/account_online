import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableColumn } from "@/components/shared/table/data-table";
import {
  AllHistoryModel,
  HistoryModel,
} from "@/features/aml/types/history/response/history-response.model";
import RiskBadge from "@/components/shared/badge/risk-level-badge";
import AmlStatusBadge from "@/components/shared/badge/aml-badge";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface HistoryTableHandlers {
  handleViewHistoryDetail: (history: HistoryModel) => void;
}

interface HistoryTableOptions {
  data: AllHistoryModel | null;
  handlers: HistoryTableHandlers;
}

export const createHistoryTableColumns = ({
  data,
  handlers,
}: HistoryTableOptions): TableColumn<HistoryModel>[] => {
  const { handleViewHistoryDetail } = handlers;

  return [
    /** Index */
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },

    /** Legal ID */
    {
      key: "legalId",
      label: "ID Number",
      minWidth: "150px",
      truncate: true,
      render: (h) => <span>{h.customerInfo?.legalId || "---"}</span>,
    },

    /** Customer Name */
    {
      key: "fullName",
      label: "Customer Name",
      minWidth: "200px",
      truncate: true,
      render: (h) => (
        <span>
          {h.customerInfo?.familyName} {h.customerInfo?.givenName || "---"}
        </span>
      ),
    },

    /** Risk Level */
    {
      key: "riskLevel",
      label: "Risk Level",
      minWidth: "150px",
      render: (h) => <RiskBadge riskLevel={h.riskLevel || "---"} />,
    },

    /** Total Rules Score */
    {
      key: "totalRulesScore",
      label: "Score",
      minWidth: "20px",
      render: (h) => (
        <span className="font-semibold text-gray-700">{h.totalRulesScore || "---"}</span>
      ),
    },

    /** Created At */
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "180px",
      truncate: true,
      render: (h) =>
        h.createdAt ? <span>{DateTimeFormat(h.createdAt) || "---"}</span> : "-",
    },

    /** Status */
    {
      key: "status",
      label: "Status",
      minWidth: "150px",
      render: (h) => <AmlStatusBadge status={h.status || "---"} />,
    },

    /** Actions */
    {
      key: "actions",
      label: "Actions",
      minWidth: "100px",
      maxWidth: "100px",
      render: (history) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewHistoryDetail(history)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];
};



