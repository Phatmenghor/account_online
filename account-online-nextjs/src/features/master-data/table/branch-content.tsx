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
import {
  AllBranchModel,
  BranchModel,
} from "@/features/master-data/types/branch/branch.response";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface BranchTableHandlers {
  handleEditBranch: (branch: BranchModel) => void;
  handleViewBranchDetail: (branch: BranchModel) => void;
  handleDeleteBranch: (branch: BranchModel) => void;
}

interface BranchTableOptions {
  data: AllBranchModel | null;
  handlers: BranchTableHandlers;
}

export const createBranchTableColumns = ({
  data,
  handlers,
}: BranchTableOptions): TableColumn<BranchModel>[] => {
  const { handleEditBranch, handleViewBranchDetail, handleDeleteBranch } =
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
      key: "branchCode",
      label: "Branch Code",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (branch) => (
        <span className="font-medium">{branch.branchCode || "---"}</span>
      ),
    },
    {
      key: "branchKh",
      label: "Branch Kh",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (branch) => (
        <span className="font-medium">{branch.branchKh || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (branch) => (
        <span className="font-medium">
          {DateTimeFormat(branch.createdAt) || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      maxWidth: "180px",
      minWidth: "160px",
      render: (branch) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBranch(branch)}
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
                  onClick={() => handleViewBranchDetail(branch)}
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
                  onClick={() => handleDeleteBranch(branch)}
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



