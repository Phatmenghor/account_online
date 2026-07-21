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
  AllSuccessAccountOnlineExcelModel,
  SuccessAccountOnlineExcelModel,
} from "@/features/account-opening/types/success-account-response.model";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface SuccessAccountExcelTableHandlers {
  handleViewAccountDetail: (account: SuccessAccountOnlineExcelModel) => void;
}

interface SuccessAccountExcelTableOptions {
  data: AllSuccessAccountOnlineExcelModel | null;
  handlers: SuccessAccountExcelTableHandlers;
}

export const createSuccessAccountExcelTableColumns = ({
  handlers,
}: SuccessAccountExcelTableOptions): TableColumn<SuccessAccountOnlineExcelModel>[] => {
  const { handleViewAccountDetail } = handlers;

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => (
        <span className="font-medium">{(index ?? 0) + 1}</span>
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
      key: "khrAccount",
      label: "KHR Account",
      truncate: true,
      maxWidth: "200px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium">{account.khrAccount || "---"}</span>
      ),
    },
    {
      key: "usdAccount",
      label: "USD Account",
      truncate: true,
      maxWidth: "200px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium">{account.usdAccount || "---"}</span>
      ),
    },
    {
      key: "mnemonic",
      label: "Mnemonic",
      truncate: true,
      maxWidth: "180px",
      minWidth: "140px",
      render: (account) => (
        <span className="font-medium">{account.mnemonic || "---"}</span>
      ),
    },
    // {
    //   key: "branchCode",
    //   label: "Branch Code",
    //   truncate: true,
    //   maxWidth: "200px",
    //   minWidth: "160px",
    //   render: (account) => (
    //     <span className="font-medium">{account.branchCode || "---"}</span>
    //   ),
    // },
    {
      key: "branchNameKh",
      label: "Branch NameKh",
      truncate: true,
      maxWidth: "200px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium">{account.branchNameKh || "---"}</span>
      ),
    },
    {
      key: "categoryAccount",
      label: "Category",
      truncate: true,
      maxWidth: "150px",
      minWidth: "120px",
      render: (account) => (
        <span className="font-medium">{account.categoryAccount || "---"}</span>
      ),
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
  ];
};


