import { LegalTypeModel } from "@/features/master-data/types/legal-type/legal-type.response";
import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { Edit, Eye, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableColumn } from "@/components/shared/table/data-table";
import { Badge } from "@/components/ui/badge";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { AllLegalTypeReq } from "@/features/master-data/types/legal-type/legal-type.request";

interface LegalTypeTableHandlers {
  handleEditLegalType: (legalType: LegalTypeModel) => void;
  handleViewLegalTypeDetail: (legalType: LegalTypeModel) => void;
  handleDeleteLegalType: (legalType: LegalTypeModel) => void;
}

interface LegalTypeTableOptions {
  data: AllLegalTypeReq | null;
  handlers: LegalTypeTableHandlers;
}

export const createLegalTypeTableColumns = ({
  data,
  handlers,
}: LegalTypeTableOptions): TableColumn<LegalTypeModel>[] => {
  const {
    handleEditLegalType,
    handleViewLegalTypeDetail,
    handleDeleteLegalType,
  } = handlers;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
      key: "nameEn",
      label: "Name (English)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (legalType) => (
        <span className="font-medium">{legalType.nameEn || "---"}</span>
      ),
    },
    {
      key: "nameKh",
      label: "Name (Khmer)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (legalType) => (
        <span className="font-medium">{legalType.nameKh || "---"}</span>
      ),
    },
    {
      key: "legalTypeValue",
      label: "Legal Type Value",
      truncate: true,
      maxWidth: "250px",
      minWidth: "20px",
      render: (legalType) => (
        <span className="font-medium">{legalType.legalTypeValue || "---"}</span>
      ),
    },

    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (legalType) => (
        <Badge className={getStatusColor(legalType?.status ?? "")}>
          <span className="ml-1">{legalType?.status || "---"}</span>
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (legal) => (
        <span className="font-medium">
          {DateTimeFormat(legal.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (legalType) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditLegalType(legalType)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{"Edit"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewLegalTypeDetail(legalType)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{"View"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteLegalType(legalType)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{"Delete"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};



