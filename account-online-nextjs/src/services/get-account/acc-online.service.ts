import { GetAccountReq } from "@/models/acc-online-get/account-online.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAccountOnlineService(request: GetAccountReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/account-online-final",
      request
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch account.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching account.",
        rawError: error,
      };
    }
  }
}
