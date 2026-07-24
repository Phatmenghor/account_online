import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/components/shared/table/data-table";

interface RequestHistoryRecord {
  status: string;
  actionUsername: string;
  remark?: string;
  createdAt: string;
}

interface RequestHistoryTableHandlers {
  // Add handlers as needed
}

interface RequestHistoryTableOptions {
  handlers?: RequestHistoryTableHandlers;
}

export const createRequestHistoryTableColumns = ({
  handlers,
}: RequestHistoryTableOptions = {}): TableColumn<RequestHistoryRecord>[] => {
  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },

    // Status
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "140px",
      minWidth: "20px",
      render: (record) => {
        const status = record.status || "---";
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";

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
      minWidth: "20px",
      render: (record) => (
        <span className="font-medium">{record.actionUsername || "---"}</span>
      ),
    },

    // Remark
    {
      key: "remark",
      label: "Remark",
      truncate: true,
      maxWidth: "250px",
      minWidth: "150px",
      render: (record) => (
        <span className="text-sm">{record.remark || "---"}</span>
      ),
    },

    // Timestamp
    {
      key: "createdAt",
      label: "Timestamp",
      truncate: true,
      maxWidth: "180px",
      minWidth: "160px",
      render: (record) => (
        <span className="font-medium text-sm">
          {record.createdAt || "---"}
        </span>
      ),
    },
  ];
};


