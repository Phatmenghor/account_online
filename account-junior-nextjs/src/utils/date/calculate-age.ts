export function calculateAge(dobStr?: string): number | null {
  if (!dobStr) return null;
  const clean = String(dobStr).trim();
  if (!clean || clean === "N/A" || clean === "null") return null;

  let birthDate: Date | null = null;

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map(Number);
    birthDate = new Date(y, m - 1, d);
  }
  // Format: DD-MM-YYYY or DD/MM/YYYY
  else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(clean)) {
    const parts = clean.split(/[-/]/).map(Number);
    birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
  }
  // Format: YYYYMMDD
  else if (/^\d{8}$/.test(clean)) {
    const y = Number(clean.slice(0, 4));
    const m = Number(clean.slice(4, 6));
    const d = Number(clean.slice(6, 8));
    birthDate = new Date(y, m - 1, d);
  } else {
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      birthDate = parsed;
    }
  }

  if (!birthDate || isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
