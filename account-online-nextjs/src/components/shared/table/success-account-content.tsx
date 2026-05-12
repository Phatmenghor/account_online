import { Button } from "@/components/ui/button";
import { indexDisplay, toProperCase } from "@/utils/common/common";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableColumn } from "./data-table";
import {
  AllSuccessAccountOnlineModel,
  SuccessAccountOnlineModel,
} from "@/models/open-acc-success/success-account-response.model";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "../badge/aml-badge";

interface SuccessAccountTableHandlers {
  handleViewAccountDetail: (account: SuccessAccountOnlineModel) => void;
}

interface SuccessAccountTableOptions {
  data: AllSuccessAccountOnlineModel | null;
  handlers: SuccessAccountTableHandlers;
}

export const createSuccessAccountTableColumns = ({
  data,
  handlers,
}: SuccessAccountTableOptions): TableColumn<SuccessAccountOnlineModel>[] => {
  const { handleViewAccountDetail } = handlers;

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index)}
        </span>
      ),
    },
    {
      key: "cif",
      label: "CIF",
      truncate: true,
      maxWidth: "150px",
      minWidth: "120px",
      render: (account) => (
        <span className="font-medium">{account.cif || "---"}</span>
      ),
    },
    {
      key: "legalId",
      label: "Legal ID",
      truncate: true,
      maxWidth: "180px",
      minWidth: "140px",
      render: (account) => (
        <span className="font-medium">{account.legalId || "---"}</span>
      ),
    },
    {
      key: "legalHolderName",
      label: "Holder Name",
      truncate: true,
      maxWidth: "250px",
      minWidth: "180px",
      render: (account) => (
        <span className="font-medium">{toProperCase(account.legalHolderName)}</span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      truncate: true,
      maxWidth: "180px",
      minWidth: "140px",
      render: (account) => (
        <span className="font-medium">{account.phoneNumber || "---"}</span>
      ),
    },
    {
      key: "branchNameKh",
      label: "Branch",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (account) => (
        <span className="font-medium">{account.branchNameKh || "---"}</span>
      ),
    },
    {
      key: "amlStatus",
      label: "AML Status",
      truncate: true,
      maxWidth: "150px",
      minWidth: "120px",
      render: (account) => <AmlStatusBadge status={account.amlStatus || "---"} />,
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "200px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium">
          {DateTimeFormat(account.createdAt) || "---"}
        </span>
      ),
    },
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
                  onClick={() => handleViewAccountDetail(account)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{"View Details"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
