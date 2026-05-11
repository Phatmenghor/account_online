import {
  AllReportExcelReq,
  AllReportRequestModel,
} from "@/models/report/report.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAccountOnlineReportAllDataService(
  request: AllReportRequestModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/report/account-online-report/all-view",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch account online report.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching account report.",
        rawError: error,
      };
    }
  }
}

export async function getAccountOnlineReportAllViewService(
  request: AllReportRequestModel
) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/report/account-online-report/all-data",
      request
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch account online report.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching account report.",
        rawError: error,
      };
    }
  }
}
