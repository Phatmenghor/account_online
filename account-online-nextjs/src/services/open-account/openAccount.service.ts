import { CreateOpenAccountReq } from "@/features/account-opening/types/openAccount.request";
import { axiosClientWithAuth, ACCOUNT_CREATION_TIMEOUT } from "@/utils/axios";
import axios from "axios";

export async function createOpenAccountService(request: CreateOpenAccountReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/open-account/process",
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
      throw { rawError: error };
    }
  }
}


