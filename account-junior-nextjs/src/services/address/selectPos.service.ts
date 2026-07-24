import { PosSelectReq } from "@/types/address/select-pos/selectPos.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getPosSelectService(request: PosSelectReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/init/place-of-birth",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch select place of birth.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching select place of birth.",
        rawError: error,
      };
    }
  }
}
