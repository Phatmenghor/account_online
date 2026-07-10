import {
  AllDistrictModel,
  DistrictModel,
} from "@/models/static/district/district.response";
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

interface DistrictTableHandlers {
  handleEditDistrict: (district: DistrictModel) => void;
  handleViewDistrictDetail: (district: DistrictModel) => void;
  handleDeleteDistrict: (district: DistrictModel) => void;
}

interface DistrictTableOptions {
  data: AllDistrictModel | null;
  handlers: DistrictTableHandlers;
}

export const createDistrictTableColumns = ({
  data,
  handlers,
}: DistrictTableOptions): TableColumn<DistrictModel>[] => {
  const { handleEditDistrict, handleViewDistrictDetail, handleDeleteDistrict } =
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
      key: "districtEn",
      label: "District (EN)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (district) => (
        <span className="font-medium">{district.districtEn || "---"}</span>
      ),
    },
    {
      key: "districtKh",
      label: "District (KH)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "120px",
      render: (district) => (
        <span className="font-medium">{district.districtKh || "---"}</span>
      ),
    },
    {
      key: "districtCode",
      label: "District Code",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (district) => (
        <span className="font-medium">{district.districtCode || "---"}</span>
      ),
    },
    {
      key: "provinceEn",
      label: "Province (EN)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (district) => (
        <span className="font-medium">
          {district.province?.provinceEn || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "CreatedAt",
      truncate: true,
      maxWidth: "190px",
      minWidth: "100px",
      render: (district) => (
        <span className="font-medium">
          {DateTimeFormat(district.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (district) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDistrict(district)}
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
                  onClick={() => handleViewDistrictDetail(district)}
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
                  onClick={() => handleDeleteDistrict(district)}
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
