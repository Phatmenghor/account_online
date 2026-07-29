import { ActionButton } from "@/components/shared/button/custom-button";
import { indexDisplay, toProperCase } from "@/utils/common/common";
import { Eye } from "lucide-react";
import { TableColumn } from "@/components/shared/table/data-table";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { ImagePreviewCell } from "@/components/shared/image/image-preview-cell";

interface JuniorAccountTableHandlers {
  handleViewAccountDetail: (account: any) => void;
}

interface JuniorAccountTableOptions {
  data: any;
  handlers: JuniorAccountTableHandlers;
}

export const createJuniorSuccessAccountTableColumns = ({
  data,
  handlers,
}: JuniorAccountTableOptions): TableColumn<any>[] => {
  const { handleViewAccountDetail } = handlers;
  const pageNo = data?.pageNo || 1;
  const pageSize = data?.pageSize || 15;

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => (
        <span className="font-medium text-xs">
          {indexDisplay(pageNo, pageSize, index)}
        </span>
      ),
    },
    {
      key: "nidImage",
      label: "NID Image",
      maxWidth: "120px",
      minWidth: "110px",
      render: (account) => (
        <ImagePreviewCell
          imageId={account.nidImageName || account.referenceDocName}
          label="NID / ID Card"
        />
      ),
    },
    {
      key: "selfieImage",
      label: "Selfie",
      maxWidth: "120px",
      minWidth: "110px",
      render: (account) => (
        <ImagePreviewCell
          imageId={account.selfieImageName}
          label="Selfie Photo"
        />
      ),
    },
    {
      key: "cif",
      label: "CIF",
      maxWidth: "200px",
      minWidth: "130px",
      render: (account) => (
        <span className="font-medium text-xs font-mono">{account.cif || "---"}</span>
      ),
    },
    {
      key: "legalId",
      label: "Legal ID",
      maxWidth: "180px",
      minWidth: "140px",
      render: (account) => (
        <span className="font-medium text-xs">{account.legalId || "---"}</span>
      ),
    },
    {
      key: "legalHolderName",
      label: "Holder Name",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium text-xs">
          {toProperCase(
            account.legalHolderName ||
              `${account.legalFirstNameEn || ""} ${account.legalLastNameEn || ""}`
          )}
        </span>
      ),
    },
    {
      key: "hasNid",
      label: "NID Mode",
      minWidth: "110px",
      render: (account) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center ${
            account.hasNid
              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          {account.hasNid ? "WITH NID" : "NO NID"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      maxWidth: "600px",
      minWidth: "160px",
      render: (account) => (
        <span className="font-medium text-xs whitespace-nowrap">
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
