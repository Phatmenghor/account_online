import { AddressSelectReq } from "@/types/address/select-address/selectAddress.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAddressSelectService(request: AddressSelectReq) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/master-data/init/address",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch select address.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage: "An unexpected error occurred while fetching select address.",
        rawError: error,
      };
    }
  }
}
