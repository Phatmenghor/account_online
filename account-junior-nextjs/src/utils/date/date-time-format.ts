// Parse a timestamp that is already in Khmer time (ICT, UTC+7) — no conversion needed.
// Bare strings like "2026-06-01T14:05:21.721387" are treated as local Khmer time.
function parseAsKhmerTime(timestamp: string): Date {
  // Strip trailing Z or offset so the browser doesn't shift the time
  const bare = timestamp.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(bare);
}

// Format date + time (AM/PM) — data is already stored in Khmer time, display as-is
export function DateTimeFormat(timestamp: string | null | undefined): string {
  if (!timestamp) return "";

  const date = parseAsKhmerTime(timestamp);

  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format only date (DD-MM-YYYY) — data is already stored in Khmer time, display as-is
export function formatDate(dateStr: string): string {
  const date = parseAsKhmerTime(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
