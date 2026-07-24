export function toRoman(num: number): string {
  const roman = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  const value = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  let result = "";
  for (let i = 0; i < value.length; i++) {
    while (num >= value[i]) {
      result += roman[i];
      num -= value[i];
    }
  }
  return result;
}

export function formatValue(value: any) {
  return value === null || value === undefined || value === "" ? "---" : value;
}

const UNREACHABLE_IMAGE_DOMAINS = ["via.placeholder.com"];

export function sanitizeImageUrl(
  url: string | null | undefined,
  fallback: string
): string {
  if (!url) return fallback;
  if (UNREACHABLE_IMAGE_DOMAINS.some((domain) => url.includes(domain))) {
    return fallback;
  }
  return url;
}

export const indexDisplay = (
  pageNo: number,
  pageSize: number,
  index: number
) => {
  return ((pageNo || 1) - 1) * (pageSize || 5) + index + 1;
};

export const formatEpochTimestamp = (epochMillis: number | null | undefined): string => {
  if (!epochMillis) return "---";
  try {
    return new Date(epochMillis).toLocaleString();
  } catch {
    return "---";
  }
};

export const toProperCase = (str: string | null | undefined): string => {
  if (!str) return "---";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatIsoDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "---";
  try {
    // Handle ISO format with fractional seconds: "2026-05-12T16:45:21.882926"
    // Truncate fractional seconds to 3 digits for proper parsing
    const cleanedIso = isoString.replace(/\.\d{6}$/, (match) => {
      return match.substring(0, 4); // Keep only milliseconds (3 digits + dot)
    });
    const date = new Date(cleanedIso);
    if (isNaN(date.getTime())) return "---";
    return date.toLocaleString();
  } catch {
    return "---";
  }
};
