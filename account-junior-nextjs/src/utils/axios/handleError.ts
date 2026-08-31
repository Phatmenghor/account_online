import axios from "axios";

/**
 * Standardized custom service error handler for all API service calls.
 * Extracts backend error messages cleanly and throws structured error objects.
 */
export function handleServiceError(error: any, fallbackMessage: string = "An error occurred"): never {
  let message = fallbackMessage;
  let raw: any = null;

  if (axios.isAxiosError(error)) {
    raw = error.response?.data;
    if (raw) {
      if (typeof raw === "string") {
        message = raw;
      } else {
        message = raw.message || raw.errorMessage || raw.error || fallbackMessage;
      }
    } else if (error.message) {
      message = error.message;
    }
    console.error("Axios error:", message);
  } else {
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    console.error("Unexpected error:", error);
  }

  throw {
    errorMessage: message,
    rawError: raw || error,
  };
}

export const handleApiError = handleServiceError;
