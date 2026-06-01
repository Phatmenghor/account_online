import { TableColumn } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { ReportModel } from "@/models/report/report.response";
import { DateTimeFormat } from "@/utils/date/date-time-format";

// Unified color map
const STATUS_COLOR_MAP: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800 border-green-200",
  FAILURE: "bg-red-100 text-red-800 border-red-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  INPROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  // add more statuses as needed
};

export const Report = (): TableColumn<ReportModel>[] => {
  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    return (
      STATUS_COLOR_MAP[status.toUpperCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => (
        <span className="font-medium">{index + 1}</span>
      ),
    },
    {
      key: "idNumber",
      label: "IdNumber",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (report) => (
        <span className="font-medium">{report.idNumber || "---"}</span>
      ),
    },
    {
      key: "remark",
      label: "Remark",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (report) => (
        <span className="font-medium">{report.remark || "---"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "150px",
      minWidth: "100px",
      render: (report) => (
        <Badge className={getStatusColor(report?.status)}>
          <span className="ml-1">{report?.status || "---"}</span>
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (report) => (
        <span className="font-medium">
          {DateTimeFormat(report.createdAt) || "---"}
        </span>
      ),
    },
  ];
};
