/**
 * Safely parse dates in DD/MM/YYYY or YYYY-MM-DD format
 * @param dateStr - Date string in DD/MM/YYYY or YYYY-MM-DD format
 * @returns Date object or null if parsing fails
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();

  // Try YYYY-MM-DD format first
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
  }

  // Try DD/MM/YYYY format
  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    const [dd, mm, yyyy] = slashParts;
    if (/^\d{1,2}$/.test(dd) && /^\d{1,2}$/.test(mm) && /^\d{4}$/.test(yyyy)) {
      const date = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
      if (!isNaN(date.getTime())) return date;
    }
  }

  return null;
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}
