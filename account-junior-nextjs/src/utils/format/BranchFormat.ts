/**
 * Converts various date formats to YYYY-MM-DD format
 * Supports: DD/MM/YYYY, DD-MM-YYYY, and YYYY-MM-DD
 * @param dateString - The date string to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // If in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  // If in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }

  return dateString;
};

/**
 * Normalizes gender values to standard "Male" or "Female" format
 * Supports various formats including English and Khmer
 * @param gender - The gender string to normalize
 * @returns Normalized gender string ("Male" or "Female")
 */
export const normalizeGender = (gender: string): string => {
  if (!gender) return "";

  const genderUpper = gender.toUpperCase().trim();

  // Male variations
  if (genderUpper === "M" || genderUpper === "MALE" || genderUpper === "ប្រុស") {
    return "Male";
  }

  // Female variations
  if (genderUpper === "F" || genderUpper === "FEMALE" || genderUpper === "ស្រី") {
    return "Female";
  }

  // Return original if no match
  return gender;
};