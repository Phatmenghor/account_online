import { ActionButton } from "@/components/shared/button/custom-button";
import { indexDisplay, toProperCase } from "@/utils/common/common";
import { Eye } from "lucide-react";
import { TableColumn } from "@/components/shared/table/data-table";
import {
  AllSuccessAccountOnlineModel,
  SuccessAccountOnlineModel,
} from "@/features/account-opening/types/success-account-response.model";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

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
      key: "nidImage",
      label: "NID Image",
      maxWidth: "120px",
      minWidth: "110px",
      render: (account) => (
        <ImagePreviewCell imageId={account.nidImageName} label="NID / ID Card" />
      ),
    },
    {
      key: "selfieImage",
      label: "Selfie",
      maxWidth: "120px",
      minWidth: "110px",
      render: (account) => (
        <ImagePreviewCell imageId={account.selfieImageName} label="Selfie Photo" />
      ),
    },
    {
      key: "cif",
      label: "CIF",
      truncate: true,
      maxWidth: "250px",
      minWidth: "20px",
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
      render: (account) => {
        const isJuniorNoNid = account.hasNid === false || String(account.hasNid) === "false" || account.legalId?.startsWith("JNR-");
        const parentNid = account.guardianLegalId || account.guardianNid;
        if (isJuniorNoNid && parentNid) {
          return (
            <div className="flex flex-col text-xs leading-tight">
              <span className="font-semibold text-gray-900">{parentNid}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Ref: {account.legalId}</span>
            </div>
          );
        }
        return <span className="font-medium text-xs">{account.legalId || "---"}</span>;
      },
    },

    {
      key: "branchNameKh",
      label: "Branch",
      truncate: true,
      maxWidth: "250px",
      minWidth: "150px",
      render: (account) => (
        <span className="font-medium">{account.branchNameKh || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "600px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium whitespace-nowrap">
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
          <ActionButton
            icon={<Eye className="h-4 w-4" />}
            tooltip="View Details"
            onClick={() => handleViewAccountDetail(account)}
          />
        </div>
      ),
    },
  ];
};
