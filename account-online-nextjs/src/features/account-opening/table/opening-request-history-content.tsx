import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/components/shared/table/data-table";

interface PendingAccountOpeningRequestHistoryDto {
  id: number;
  requestId: number;
  legalId: string;
  status: string;
  actionUsername: string;
  remark?: string;
  createdAt: string;
}

export const createOpeningRequestHistoryTableColumns =
  (): TableColumn<PendingAccountOpeningRequestHistoryDto>[] => {
    return [
      {
        key: "index",
        label: "#",
        maxWidth: "60px",
        minWidth: "60px",
        render: (_, index) => <span className="font-medium">{index + 1}</span>,
      },

      // Request ID
      {
        key: "requestId",
        label: "Request ID",
        truncate: true,
        maxWidth: "100px",
        minWidth: "80px",
        render: (record) => (
          <span className="font-medium">{record.requestId || "---"}</span>
        ),
      },

      // Legal ID
      {
        key: "legalId",
        label: "Legal ID",
        truncate: true,
        maxWidth: "150px",
        minWidth: "120px",
        render: (record) => (
          <span className="font-medium">{record.legalId || "---"}</span>
        ),
      },

      // Status
      {
        key: "status",
        label: "Action",
        truncate: true,
        maxWidth: "120px",
        minWidth: "100px",
        render: (record) => {
          const status = record.status || "---";
          let badgeVariant: "default" | "secondary" | "destructive" | "outline" =
            "outline";

          if (status === "APPROVED") {
            badgeVariant = "default";
          } else if (status === "REJECTED") {
            badgeVariant = "destructive";
          } else if (status === "PENDING") {
            badgeVariant = "secondary";
          }

          return <Badge variant={badgeVariant}>{status}</Badge>;
        },
      },

      // Action Username
      {
        key: "actionUsername",
        label: "Action By",
        truncate: true,
        maxWidth: "150px",
        minWidth: "120px",
        render: (record) => (
          <span className="text-sm">{record.actionUsername || "---"}</span>
        ),
      },

      // Remark
      {
        key: "remark",
        label: "Remark",
        truncate: true,
        maxWidth: "200px",
        minWidth: "150px",
        render: (record) => (
          <span className="text-sm text-gray-600">
            {record.remark || "---"}
          </span>
        ),
      },

      // Created At
      {
        key: "createdAt",
        label: "Date & Time",
        truncate: true,
        maxWidth: "180px",
        minWidth: "160px",
        render: (record) => (
          <span className="text-sm">
            {record.createdAt
              ? new Date(record.createdAt).toLocaleString()
              : "---"}
          </span>
        ),
      },
    ];
  };

