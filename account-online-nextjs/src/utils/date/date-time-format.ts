// Normalize timestamp: if no timezone, treat as UTC
function normalizeTimestamp(timestamp: string): string {
  // If timestamp already has Z or +07:00 or any offset → return as-is
  if (timestamp.includes("Z") || timestamp.includes("+")) {
    return timestamp;
  }
  // Else: force UTC
  return timestamp + "Z";
}

// Format date + time (AM/PM) in Cambodia Time
export function DateTimeFormat(timestamp: string | null | undefined): string {
  if (!timestamp) return "";

  const normalized = normalizeTimestamp(timestamp);
  const date = new Date(normalized);

  return date.toLocaleString("en-US", {
    timeZone: "Asia/Phnom_Penh",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Format only date (DD-MM-YYYY) in Cambodia Time
export function formatDate(dateStr: string): string {
  const normalized = normalizeTimestamp(dateStr);
  const date = new Date(normalized);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Phnom_Penh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const formatted = date.toLocaleDateString("en-GB", options); // DD/MM/YYYY

  return formatted.replace(/\//g, "-"); // Convert to DD-MM-YYYY
}
