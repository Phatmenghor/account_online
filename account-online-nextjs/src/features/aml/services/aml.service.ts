import { AccountOnlineReportRequest } from "@/features/aml/types/chart/aml-chart.request";
import { axiosClientWithAuth, handleServiceError } from "@/utils/axios";

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
    handleServiceError(error, "Failed to fetch account online report.");
  }
}
