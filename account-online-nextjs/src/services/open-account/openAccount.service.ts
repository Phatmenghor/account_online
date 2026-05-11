import { CreateOpenAccountReq } from "@/models/open-account/openAccount.request";
import { axiosClientWithAuth, ACCOUNT_CREATION_TIMEOUT } from "@/utils/axios";
import axios from "axios";

export async function createOpenAccountService(request: CreateOpenAccountReq) {
  try {
    // Account creation can take longer due to multiple backend operations:
    // - Customer matching, validation, AML processing
    // - Customer creation, KHR/USD account creation, validation
    // - Mobile banking activation
    // Timeout is configurable via NEXT_PUBLIC_ACCOUNT_CREATION_TIMEOUT env variable (default: 5 minutes)
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/open-account/submit",
      request,
      { timeout: ACCOUNT_CREATION_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message;
      console.error("Axios error:", message);

      throw {
        errorMessage: message,
        rawError: raw,
        status: error.response?.status,
      };
    } else {
      console.error("Unexpected error:", error);
      throw {
        rawError: error,
      };
    }
  }
}
