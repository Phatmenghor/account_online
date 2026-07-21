import axios from "axios";

export function handleApiError(error: any, fallbackMessage: string): never {
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
    console.error("Axios error:", message, raw);
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
