export function formatDate(raw: string): string {
  if (!raw || raw.trim() === "") return "";

  // Try to parse DD/MM/YYYY format (from OCR)
  const slashFormat = raw.split("/");
  if (slashFormat.length === 3) {
    const [dd, mm, yyyy] = slashFormat;
    if (dd && mm && yyyy && /^\d{1,2}$/.test(dd) && /^\d{1,2}$/.test(mm) && /^\d{4}$/.test(yyyy)) {
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
  }

  // Already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // Try parsing with Date constructor for other formats
  const date = new Date(raw);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // Return as-is if no conversion possible
  console.warn(`Unable to parse date: ${raw}`);
  return raw;
}


export const convertGenderForAPI = (gender: string): string => {
  if (!gender) return "";
  const genderUpper = gender.toUpperCase().trim();
  if (genderUpper === "MALE") return "M";
  if (genderUpper === "FEMALE") return "F";
  return gender;
};