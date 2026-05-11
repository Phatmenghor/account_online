import { AccountOnlineReportRequest } from "@/models/aml/chart/aml-chart.request";
import { axiosClientWithAuth } from "@/utils/axios";
import axios from "axios";

export async function getAccountOnlineReportService(
  params: AccountOnlineReportRequest
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/api/v1/report/account-online-report`,
      null,
      { params }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const raw = error.response?.data;
      const message = raw?.message || "Failed to fetch account online report.";
      console.error("Axios error:", message);

      throw { errorMessage: message, rawError: raw };
    } else {
      console.error("Unexpected error:", error);
      throw {
        errorMessage:
          "An unexpected error occurred while fetching account online report.",
        rawError: error,
      };
    }
  }
}
