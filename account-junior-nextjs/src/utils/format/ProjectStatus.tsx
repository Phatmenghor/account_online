// utils/statusFormatter.ts
export function formatStatus(status?: string) {
  if (!status) return "---";
  switch (status.toUpperCase()) {
    case "UAT":
      return "uat";
    case "PRODUCTION":
      return "Production";
    default:
      return status;
  }
}

export function formatStatusApp(status?: string) {
  if (!status) return "---";
  switch (status.toUpperCase()) {
    case "UAT":
      return "UAT";
    case "PRODUCTION":
      return "Production";
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "DEVELOPMENT":
      return "Development";
    default:
      return status;
  }
}

