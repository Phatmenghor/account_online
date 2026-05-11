import {
  AllReferenceModel,
  ReferenceModel,
} from "@/models/static/reference/reference.response";
import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { Edit, Eye, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TableColumn } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface ReferenceTableHandlers {
  handleEditReference: (reference: ReferenceModel) => void;
  handleViewReferenceDetail: (reference: ReferenceModel) => void;
  handleDeleteReference: (reference: ReferenceModel) => void;
}

interface ReferenceTableOptions {
  data: AllReferenceModel | null;
  handlers: ReferenceTableHandlers;
}

export const createReferenceTableColumns = ({
  data,
  handlers,
}: ReferenceTableOptions): TableColumn<ReferenceModel>[] => {
  const {
    handleEditReference,
    handleViewReferenceDetail,
    handleDeleteReference,
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

  const tCommon = useTranslations("common");

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
      render: (reference) => (
        <span className="font-medium">{reference.nameEn || "---"}</span>
      ),
    },
    {
      key: "nameKh",
      label: "Name (Khmer)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (reference) => (
        <span className="font-medium">{reference.nameKh || "---"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (reference) => (
        <Badge className={getStatusColor(reference?.status ?? "")}>
          <span className="ml-1">{reference?.status || "---"}</span>
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (reference) => (
        <span className="font-medium">
          {DateTimeFormat(reference.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (reference) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditReference(reference)}
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
                  onClick={() => handleViewReferenceDetail(reference)}
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
                  onClick={() => handleDeleteReference(reference)}
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
