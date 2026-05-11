import {
  AllVillageModel,
  VillageModel,
} from "@/models/static/village/village.response";
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
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface VillageTableHandlers {
  handleEditVillage: (village: VillageModel) => void;
  handleViewVillageDetail: (village: VillageModel) => void;
  handleDeleteVillage: (village: VillageModel) => void;
}

interface VillageTableOptions {
  data: AllVillageModel | null;
  handlers: VillageTableHandlers;
}

export const createVillageTableColumns = ({
  data,
  handlers,
}: VillageTableOptions): TableColumn<VillageModel>[] => {
  const { handleEditVillage, handleViewVillageDetail, handleDeleteVillage } =
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
      key: "villageCode",
      label: "Village Code",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (village) => (
        <span className="font-medium">{village.villageCode || "---"}</span>
      ),
    },
    {
      key: "villageEn",
      label: "Village (English)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">{village.villageEn || "---"}</span>
      ),
    },
    {
      key: "villageKh",
      label: "Village (Khmer)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">{village.villageKh || "---"}</span>
      ),
    },
    {
      key: "communeCode",
      label: "Commune Code",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (village) => (
        <span className="font-medium">
          {village.commune?.communeCode || "---"}
        </span>
      ),
    },
    {
      key: "communeEn",
      label: "Commune (English)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">
          {village.commune?.communeEn || "---"}
        </span>
      ),
    },
    {
      key: "districtCode",
      label: "District Code",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">
          {village.commune?.district?.districtCode || "---"}
        </span>
      ),
    },
    {
      key: "districtEn",
      label: "District (English)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">
          {village.commune?.district?.districtEn || "---"}
        </span>
      ),
    },
    {
      key: "provinceCode",
      label: "Province Code",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">
          {village.commune?.district?.province?.provinceCode || "---"}
        </span>
      ),
    },
    {
      key: "provinceEn",
      label: "Province (English)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (village) => (
        <span className="font-medium">
          {village.commune?.district?.province?.provinceEn || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "CreatedAt",
      truncate: true,
      maxWidth: "190px",
      minWidth: "100px",
      render: (village) => (
        <span className="font-medium">
          {DateTimeFormat(village.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (village) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditVillage(village)}
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
                  onClick={() => handleViewVillageDetail(village)}
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
                  onClick={() => handleDeleteVillage(village)}
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
