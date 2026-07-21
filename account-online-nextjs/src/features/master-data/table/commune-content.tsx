import {
  AllCommuneModel,
  CommuneModel,
} from "@/features/master-data/types/commune/commune.response";
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
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface CommuneTableHandlers {
  handleEditCommune: (commune: CommuneModel) => void;
  handleViewCommuneDetail: (commune: CommuneModel) => void;
  handleDeleteCommune: (commune: CommuneModel) => void;
}

interface CommuneTableOptions {
  data: AllCommuneModel | null;
  handlers: CommuneTableHandlers;
}

export const createCommuneTableColumns = ({
  data,
  handlers,
}: CommuneTableOptions): TableColumn<CommuneModel>[] => {
  const { handleEditCommune, handleViewCommuneDetail, handleDeleteCommune } =
    handlers;

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
      key: "communeEn",
      label: "Commune (EN)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (commune) => (
        <span className="font-medium">{commune.communeEn || "---"}</span>
      ),
    },
    {
      key: "communeKh",
      label: "Commune (KH)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "120px",
      render: (commune) => (
        <span className="font-medium">{commune.communeKh || "---"}</span>
      ),
    },
    {
      key: "communeCode",
      label: "Commune Code",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (commune) => (
        <span className="font-medium">{commune.communeCode || "---"}</span>
      ),
    },
    {
      key: "districtEn",
      label: "District (EN)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (commune) => (
        <span className="font-medium">
          {commune.district?.districtEn || "---"}
        </span>
      ),
    },
    {
      key: "provinceEn",
      label: "Province (EN)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (commune) => (
        <span className="font-medium">
          {commune.district?.province?.provinceEn || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "CreatedAt",
      truncate: true,
      maxWidth: "190px",
      minWidth: "100px",
      render: (commune) => (
        <span className="font-medium">
          {DateTimeFormat(commune.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (commune) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCommune(commune)}
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
                  onClick={() => handleViewCommuneDetail(commune)}
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
                  onClick={() => handleDeleteCommune(commune)}
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



