/**
 * Helper function to determine whether Date of Birth (ថ្ងៃខែឆ្នាំកំណើត) age restriction check
 * is disabled on the frontend during Development/Testing.
 * 
 * - Development (NODE_ENV !== "production" || NEXT_PUBLIC_DISABLE_AGE_CHECK === "true"): Returns true (Age check disabled for easy testing)
 * - Production (NODE_ENV === "production"): Returns false (Strict age check enforced)
 */
export function isAgeCheckDisabled(): boolean {
  // Allow manual toggle via env var
  if (process.env.NEXT_PUBLIC_DISABLE_AGE_CHECK === "true") {
    return true;
  }
  if (process.env.NEXT_PUBLIC_DISABLE_AGE_CHECK === "false") {
    return false;
  }
  // By default in Development mode, age check is disabled for testing
  return process.env.NODE_ENV !== "production";
}
