import { AllHistoryRequest } from "@/features/aml/types/history/request/history-request.model";
import { axiosClientWithAuth } from "@/utils/axios";
import { handleApiError } from "@/utils/axios/handleError";

export async function getAllJuniorAmlHistoryService(request: AllHistoryRequest) {
  try {
    const response = await axiosClientWithAuth.post(
      "/api/v1/junior-aml/all-history",
      request
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error, "Failed to fetch Junior AML history.");
  }
}
