import {
  AllOccupationModel,
  OccupationModel,
} from "@/features/master-data/types/occupation/occupation.response";
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
import { TableColumn } from "@/components/shared/table/data-table";
import { Badge } from "@/components/ui/badge";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface OccupationTableHandlers {
  handleEditOccupation: (occupation: OccupationModel) => void;
  handleViewOccupationDetail: (occupation: OccupationModel) => void;
  handleDeleteOccupation: (occupation: OccupationModel) => void;
}

interface OccupationTableOptions {
  data: AllOccupationModel | null;
  handlers: OccupationTableHandlers;
}

export const createOccupationTableColumns = ({
  data,
  handlers,
}: OccupationTableOptions): TableColumn<OccupationModel>[] => {
  const {
    handleEditOccupation,
    handleViewOccupationDetail,
    handleDeleteOccupation,
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
      render: (occupation) => (
        <span className="font-medium">{occupation.nameEn || "---"}</span>
      ),
    },
    {
      key: "nameKh",
      label: "Name (Khmer)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (occupation) => (
        <span className="font-medium">{occupation.nameKh || "---"}</span>
      ),
    },
    {
      key: "occupationCode",
      label: "Occupation Code",
      truncate: true,
      maxWidth: "250px",
      minWidth: "20px",
      render: (occupation) => (
        <span className="font-medium">
          {occupation.occupationCode || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (occupation) => (
        <Badge className={getStatusColor(occupation?.status ?? "")}>
          <span className="ml-1">{occupation?.status || "---"}</span>
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (occupation) => (
        <span className="font-medium">
          {DateTimeFormat(occupation.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (occupation) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditOccupation(occupation)}
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
                  onClick={() => handleViewOccupationDetail(occupation)}
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
                  onClick={() => handleDeleteOccupation(occupation)}
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



