import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { Edit, Eye, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableColumn } from "./data-table";
import {
  AllProvinceModel,
  ProvinceModel,
} from "@/models/static/province/province.response";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface ProvinceTableHandlers {
  handleEditProvince: (province: ProvinceModel) => void;
  handleViewProvinceDetail: (province: ProvinceModel) => void;
  handleDeleteProvince: (province: ProvinceModel) => void;
}

interface ProvinceTableOptions {
  data: AllProvinceModel | null;
  handlers: ProvinceTableHandlers;
}

export const createProvinceTableColumns = ({
  data,
  handlers,
}: ProvinceTableOptions): TableColumn<ProvinceModel>[] => {
  const { handleEditProvince, handleViewProvinceDetail, handleDeleteProvince } =
    handlers;

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
      key: "provinceEn",
      label: "Province (EN)",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (province) => (
        <span className="font-medium">{province.provinceEn || "---"}</span>
      ),
    },
    {
      key: "provinceKh",
      label: "Province (KH)",
      truncate: true,
      maxWidth: "200px",
      minWidth: "120px",
      render: (province) => (
        <span className="font-medium">{province.provinceKh || "---"}</span>
      ),
    },
    {
      key: "provinceCode",
      label: "Province Code",
      truncate: true,
      maxWidth: "180px",
      minWidth: "120px",
      render: (province) => (
        <span className="font-medium">{province.provinceCode || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "CreatedAt",
      truncate: true,
      maxWidth: "190px",
      minWidth: "100px",
      render: (province) => (
        <span className="font-medium">
          {DateTimeFormat(province.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (province) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProvince(province)}
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
                  onClick={() => handleViewProvinceDetail(province)}
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
                  onClick={() => handleDeleteProvince(province)}
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
