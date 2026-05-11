import {
  AllMaritalModel,
  MaritalModel,
} from "@/models/static/marital/marital.response";
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

interface MaritalTableHandlers {
  handleEditMarital: (marital: MaritalModel) => void;
  handleViewMaritalDetail: (marital: MaritalModel) => void;
  handleDeleteMarital: (marital: MaritalModel) => void;
}

interface MaritalTableOptions {
  data: AllMaritalModel | null;
  handlers: MaritalTableHandlers;
}

export const createMaritalTableColumns = ({
  data,
  handlers,
}: MaritalTableOptions): TableColumn<MaritalModel>[] => {
  const { handleEditMarital, handleViewMaritalDetail, handleDeleteMarital } =
    handlers;

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
      render: (marital) => (
        <span className="font-medium">{marital.nameEn || "---"}</span>
      ),
    },
    {
      key: "nameKh",
      label: "Name (Khmer)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (marital) => (
        <span className="font-medium">{marital.nameKh || "---"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (marital) => (
        // <span className="font-medium">{marital.status || "---"}</span>
        <Badge className={getStatusColor(marital?.status ?? "")}>
          <span className="ml-1">{marital?.status || "---"}</span>
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (marital) => (
        <span className="font-medium">
          {DateTimeFormat(marital.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (marital) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditMarital(marital)}
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
                  onClick={() => handleViewMaritalDetail(marital)}
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
                  onClick={() => handleDeleteMarital(marital)}
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
