import { AllSuccessAccountOnlineExcelReq, AllSuccessAccountOnlineReq } from "@/features/account-opening/types/success-account.request.model";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getSuccessAccountOnlineService(
  request: AllSuccessAccountOnlineReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/account-online-final/success-list",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch success account.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching success account.",
        rawError: error,
      };
    }
  }
}


export async function getSuccessAccountOnlineExcelService(
  request: AllSuccessAccountOnlineExcelReq
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/account-online-final/success-list/excel",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch success account.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching success account excels.",
        rawError: error,
      };
    }
  }
}


