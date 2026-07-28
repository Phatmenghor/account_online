import { CreateOpenAccountReq } from "@/features/account-opening/types/openAccount.request";
import { axiosClientWithAuth, ACCOUNT_CREATION_TIMEOUT } from "@/utils/axios";
import axios from "axios";

export async function createOpenAccountService(request: CreateOpenAccountReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/junior-open-account/process",
      request,
      { timeout: ACCOUNT_CREATION_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      let backendMessage: string | null = null;
      if (typeof raw === "string" && raw.trim().length > 0) {
        backendMessage = raw;
      } else if (raw && typeof raw === "object") {
        backendMessage = raw.message || raw.error || raw.details?.message || null;
      }

      const message =
        backendMessage ||
        (error.response?.status === 409
          ? "លោកអ្នកមានគណនីជាមួយធនាគាររួចហើយ។ សូមប្រើប្រាស់ជាមួយគណនីរបស់លោកអ្នក។"
          : error.message);

      console.error("Axios error:", message);
      throw {
        errorMessage: message,
        rawError: raw,
        status: error.response?.status,
      };
    } else {
      console.error("Unexpected error:", error);
      throw { errorMessage: (error as any)?.message || "Unexpected error occurred", rawError: error };
    }
  }
}
