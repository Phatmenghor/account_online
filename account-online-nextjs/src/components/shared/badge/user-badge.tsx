import { Status } from "@/constants/AppResource/display-list/enum/status";

interface StatusBadgeProps {
  status: string;
}

export const UserStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case Status.ACTIVE:
        return {
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          label: "Active",
        };
      case Status.DELETE:
        return {
          className:
            "bg-red-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          label: "Delete",
        };
      default:
        return {
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          label: "Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <span
      className={`px-1 py-1 rounded-lg text-center text-xs font-medium ${statusConfig.className}`}
    >
      {statusConfig.label}
    </span>
  );
};
