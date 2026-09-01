/**
 * Helper function to determine whether Date of Birth (ថ្ងៃខែឆ្នាំកំណើត) age restriction & CamDX check
 * is disabled on the frontend during Development/Testing in account-junior-nextjs.
 * 
 * - Development (NODE_ENV !== "production" || NEXT_PUBLIC_DISABLE_AGE_CHECK === "true"): Returns true (Age & DOB mismatch checks disabled for easy testing)
 * - Production (NODE_ENV === "production"): Returns false (Strict age & CamDX DOB checks enforced)
 */
export function isAgeCheckDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_DISABLE_AGE_CHECK === "true") {
    return true;
  }
  if (process.env.NEXT_PUBLIC_DISABLE_AGE_CHECK === "false") {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}
